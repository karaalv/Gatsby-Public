/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity, 
    FlatList, 
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthContext } from '../../../../utilities/sessionProvider';

/* Import Custom Components */
import OrganiserNavbar from '../../../../components/organiserNavbar';

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { pullAccountEventDataCards } from '../../../../scripts/GatsbyFirestoreFunctions';

/* UI Callback Functions */
import { renderEventDataCard, renderLoadingError } from '../../../../scripts/FrontendFunctions';

/* UI Types */
import { EventDataCardProps } from '../../../../types/UiComponentTypes';

/**
 * The organiser dashboard is used for managing 
 * hosted events, in addition to creating new
 * events on the platform.
 * 
 * @returns Event dashboard.
 */
export default function EventDashboard(){
    // Fetch organiser details.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Scroll state management.
    const [isScrolling, setIsScrolling] = useState(false);

    /* FIRESTORE */

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [eventDataCards, setEventDataCards] = useState<EventDataCardProps[] | null>(null);

    // Fetch account event data.
    useEffect(() => {
        const fetch = async () => {
            const data = await pullAccountEventDataCards({accountID: user.uid});

            // Check for loading error.
            if(data === null){
                setLoadingError(true);
            } else {
                setEventDataCards(data);
            }
            setIsLoading(false);
        }
        fetch();
    }, [])

    const headerComponent = () => {
        return(
            <View style={{
                margin: '2.5%',
                marginBottom: '3%',
            }}>
                <Text style={{
                    margin: '5%',
                    marginBottom: '2.5%',
                    fontSize: 26, 
                    fontWeight: '700'
                }}>
                    Dashboard
                </Text>

                {/* New event button */}
                <TouchableOpacity 
                    style={styles.newEventButtonContainer}
                    activeOpacity={0.5}
                    onPress={() => {
                        router.push('(app)/organiser/(dashboard)/(newEvent)/newEvent');
                    }}
                >
                    <Text style={{
                        color: GatsbyStyles.gatsbyColours.white,
                        fontSize: 18,
                        fontWeight: '800'
                    }}>
                        New Event +
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    // Render when account has no events.
    const empty = () => {
        return(
            <View style={{marginTop: '20%'}}>
                {headerComponent()}
                <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: GatsbyStyles.gatsbyColours.grey,
                    alignSelf: 'center',
                    marginTop: '10%',
                }}>
                    No events
                </Text>
            </View>
        )
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1
        }}>


            {/* Event data cards */}
            {isLoading? 
                <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
            :
                loadingError?
                    renderLoadingError()
                :
                    eventDataCards.length > 0?
                        <FlatList
                            data={eventDataCards}
                            renderItem={({item}) => renderEventDataCard({item: item})}
                            style={styles.container}
                            contentContainerStyle={{paddingTop: '15%', paddingBottom: '25%'}}
                            showsVerticalScrollIndicator={false}
                            onScrollBeginDrag={() => setIsScrolling(true)}
                            ListHeaderComponent={headerComponent}
                        />    
                    :
                        empty()        
            }

            {/* Render Organiser Navigation bar */}
            <OrganiserNavbar
                navigationState='dashboard'
                isParentScrolling={isScrolling}
            />
        </View>
    )
}

/* Page Styles */
const styles = StyleSheet.create({
    container:{
        width: '100%',
        height: '100%',
        alignSelf: 'center',
    },
    newEventButtonContainer:{
        margin: '5%',
        padding: '5%',
        alignItems: 'center',
        alignSelf: 'center',
        width: '90%',
        height: 'auto',
        borderRadius: 15,
        backgroundColor: GatsbyStyles.gatsbyColours.gold
    }
})