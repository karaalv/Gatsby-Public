/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Keyboard, 
    Animated, 
    FlatList, 
    Platform,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../utilities/sessionProvider';

/* Import Custom Components */
import BackNavigationButton from '../components/backNavigationButton';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* UI Callback Functions */
import { renderLoadingError } from "../scripts/FrontendFunctions";

/* Import Component Types */
import { MessageProps } from '../types/UiComponentTypes';

/* Import Firebase Services */
import { FIRESTORE_DB } from '../firebaseConfig';
import { onSnapshot, collection, doc, updateDoc, DocumentReference, getDoc } from 'firebase/firestore';
import { pullAccountInfo, pullMessages, pushMessage } from "../scripts/GatsbyFirestoreFunctions";
import { useAccountTypeContext } from '../utilities/accountTypeProvider';

/**
 * This page contains messages between two
 * accounts on the platform, facilitated 
 * by the firebase realtime data base.
 * @returns Message page
 */
export default function MessagePageComponent(){

    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Obtain sending account type from hook.
    const accountObservingType = useAccountTypeContext();

    // Local search parameters hook.
    const { recipientID,  recipientAccountType } = useLocalSearchParams();

    /* CHAT ID */
    let chatID: string;
    const compare = `${recipientID}`.localeCompare(user.uid);

    if(compare < 0){
        chatID = `chat_${recipientID}_${user.uid}`
    } else {
        chatID = `chat_${user.uid}_${recipientID}`
    }

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    const [isScrolling, setIsScrolling] = useState(false);

    // Input text state.
    const [inputText, setInputText] = useState('');

    // Height for text input container.
    const [inputHeight, setInputHeight] = useState(1);

    /* Text input animation. */
    const translateY = useRef(new Animated.Value(0)).current;

    /* Keyboard state. */
    const [isKeyboardActive, setKeyboardActive] = useState(false);

    // Use effect hook used to track keyboard state.
    useEffect(() => {
    
        // When keyboard activated, translate text input field.
        const showListener = Keyboard.addListener('keyboardWillShow', () => {
            setKeyboardActive(true);
            Animated.timing(translateY, {
                toValue: -310,
                duration: 200,
                useNativeDriver: true
            }).start();
        })
    
        // When keyboard deactivated, translate text input field.
        const hideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardActive(false);
            Animated.timing(translateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        })

        return() => {
            showListener.remove();
            hideListener.remove();
        }

    }, [isKeyboardActive]);

    /* FIRESTORE */
    const [recipientUsername, setRecipientUsername] = useState(null);
    const [messages, setMessages] = useState<MessageProps[] | null>(null);

    // Loading states.
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const [loadingError, setLoadingError] = useState(false);
    const [sendingMessageError, setSendingMessageError] = useState(false);

    // Get chat details and update chat as read on component mount.
    useEffect(() => {
        // Fetch recipient details.
        const fetch = async () => {
            const data = await pullAccountInfo({accountID: `${recipientID}`, context: `${recipientAccountType}`})
            setRecipientUsername(data.username);
        }
        // Mark chat as read.
        const markAsRead = async () => {
            // Update recipient inbox.
            let docRef: DocumentReference;
            if(accountObservingType === 'user'){
                docRef = doc(
                    FIRESTORE_DB, 
                    'UserAccounts', 
                    `user_${user.uid}`, 
                    'inboxSubCollection',
                    chatID
                );
            } else {
                docRef = doc(
                    FIRESTORE_DB, 
                    'OrganiserAccounts', 
                    `organiser_${user.uid}`,
                    'inboxSubCollection' ,
                    chatID
                );
            }
            
            // Check if chat history exists, mark chat as read.
            const check = await getDoc(docRef);
            if(check.exists()){
                await updateDoc(docRef, {
                    isRead: true
                })
            }
        }
        fetch();
        markAsRead();
    }, [])
    
    // Get messages.
    useEffect(() => {
        const fetch = async () => {
            const data = await pullMessages({chatID: chatID, recipientID: `${recipientID}`, senderID: user.uid});
            // Check for loading error.
            if(data === null){
                setLoadingError(true);
            } else {
                setMessages(data.reverse());
            }
            setIsLoadingMessages(false);
        }
        fetch();
    }, [])

    // Subscribe to new messages.
    useEffect(() => {
        // Chat reference.
        const chatRef = collection(
            FIRESTORE_DB, 
            'ChatsDB', 
            chatID,
            'messages'
        );

        const unsubscribe = onSnapshot(chatRef, (snapShot) => {
            const newMessages = snapShot.docs.map((documents) => {
                const {
                    createdBy, 
                    content,
                    messageID,
                    messageHeight
                } = documents.data();

                const newMessage: MessageProps = {
                    createdBy: createdBy,
                    content: content,
                    messageID: messageID,
                    messageHeight: messageHeight
                }
                return newMessage
            })
            setMessages(newMessages.reverse());
        })

        // Clean up listener.
        return () => {
            unsubscribe();
        }
    }, [])

    /* Callback functions */

    // Used to render each message in chat.
    function renderMessage(item: MessageProps) {
        const context = item.createdBy === user.uid? 'from' : 'to';
        return(
            <View style={
                [
                    styles.messageContainer,
                    {
                        height: item.messageHeight
                    },
                        context === 'from'?
                            styles.messageFrom
                        :
                            styles.messageTo
                ]}
                key={item.messageID}>
                <Text style={{color: context==='from'? GatsbyStyles.gatsbyColours.white : GatsbyStyles.gatsbyColours.black, fontWeight: 'bold'}}>
                    {item.content}
                </Text>
            </View> 
        )
    }

    // Send message callback.
    async function sendMessage(){
        setIsSendingMessage(true);
        setInputText('');
        Keyboard.dismiss();
        const response = await pushMessage({
            chatID: chatID,
            recipientID: `${recipientID}`, 
            senderID: user.uid, 
            content:inputText, 
            messageHeight: ((Math.round((inputHeight/10))*10) + 30),
            recipientAccountType: `${recipientAccountType}`,
            senderAccountType: accountObservingType
        })
        // Catch sending message error.
        if(response === null){
            setSendingMessageError(true);
        }
        setIsSendingMessage(false);
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1,
            flexDirection: 'column',
        }}>
            {/* Screen content. */}

            {/* header */}
            <View style={[styles.backLinkContainer, {opacity:isScrolling? 0.3:1}]}>
                {/* Back button. */}
                <BackNavigationButton
                    onPress={() => router.back()}
                />
                <Text style={{fontSize: 18, fontWeight: '700'}}>{recipientUsername}</Text>
            </View>

            {/* Animated view - disabled on android. */}
            <Animated.View style={{
                    transform: Platform.OS === 'ios'? [{translateY}] : [],
                    width: '100%',
                    height: '100%'
                }}>
                {/* Messages */}
                {isLoadingMessages? 
                    <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
                :
                    loadingError?
                        renderLoadingError()
                    :
                        <FlatList
                            data={messages}
                            renderItem={({item}) => renderMessage(item)}
                            style={styles.flatListContainer}
                            contentContainerStyle={{paddingTop: '25%', padding: '1%', paddingBottom: isKeyboardActive? '125%':'40%'}}
                            inverted={true}
                            onScrollBeginDrag={() => setIsScrolling(true)}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps = 'never'
                        />                
                }

                {/* Message content container. */}
                <View style={styles.inputBarContainer}>
                    
                    {/* Message input field container. */}
                    <View style={[styles.messageFieldContainer, {height: Math.min(175,((Math.round((inputHeight/10))*10) + 30))}]}>

                        {/* Text input bar. */}
                        <View style={[styles.textInputContainer, {height: Math.min(175,((Math.round((inputHeight/10))*10) + 30))}]}>
                            <TextInput 
                                style={[styles.textInput, {height: Math.min(150, (Math.round((inputHeight/10))*10) + 10)}]}
                                placeholder='Say Something ...'
                                multiline={true}
                                value={inputText}
                                onContentSizeChange={(event) => {
                                    // Set input container heights.
                                    setInputHeight(event.nativeEvent.contentSize.height);
                                }}
                                onChangeText={(text) => {
                                    // Set input text state.
                                    setInputText(text);
                                }}
                            />
                        </View>

                        {/* Send message button. */}
                        <TouchableOpacity 
                            onPress={inputText === ''? ()=>{} : sendMessage} 
                            style={[
                                styles.sendMessageButton,
                                sendingMessageError? styles.sendMessageButtonError : {}, 
                                {
                                    opacity: inputText === ''? 0.5:1
                                }
                            ]} 
                            activeOpacity={0.7}
                            >
                                <Image
                                    source={require('../assets/Utilities/SendMessageIcon.png')}
                                    style={{width: 30, height: 30, objectFit: 'contain', alignSelf: 'center'}}
                                    tintColor={GatsbyStyles.gatsbyColours.white}
                                />  
                        </TouchableOpacity>
                        
                    </View>

                </View>
            </Animated.View>

        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    backLinkContainer: {
        height: 'auto',
        width: 'auto',
        alignItems: 'center',
        position: 'absolute', 
        top: '2.5%', 
        left: '0%',
        flexDirection: 'row',
        zIndex: 1,
    },
    inputBarContainer:{
        position: 'absolute',
        bottom: '5%',
        alignSelf: 'center'
    },
    messageFieldContainer:{
        width: '97.5%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    textInputContainer:{
        width: '85%',
        bottom: '0%',
        borderWidth: 3,
        borderRadius: 15,
        padding: '2%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GatsbyStyles.gatsbyColours.white
    },
    textInput: {
        width: '95%',
        fontSize: 15,
        textAlignVertical: 'top',
    },
    sendMessageButton: {
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        width: 50,
        height: 50,
        marginLeft: 5,
        borderRadius: 15,
        justifyContent:'center',
        alignSelf: 'flex-end'
    },
    sendMessageButtonError:{
        borderColor: GatsbyStyles.gatsbyColours.red,
        borderWidth: 3
    },
    flatListContainer: {
        width: '90%',
        height: '100%',
        alignSelf: 'center',
        bottom: '0%',
    },
    messageContainer:{
        width: '90%',
        marginBottom: '10%',
        fontSize: 15,
        borderRadius: 15,
        justifyContent: 'center',
        padding: '3%'
    },
    messageFrom:{
        alignSelf: 'flex-end',
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
    },
    messageTo:{
        alignSelf: 'flex-start',
        backgroundColor: GatsbyStyles.gatsbyColours.grey,
    }
})