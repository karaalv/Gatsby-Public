/* Import utilities. */
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";

/* Import Component Types */
import { AccountDetailsProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/**
 * This component renders an explorable view 
 * of a organiser account.
 *  
 * @param {AccountDetailsProps} 
 * @returns Organiser Details Component
 */
export default function OrganiserAccountDetails({accountID}: AccountDetailsProps){
    // Fetch account data from firestore.
    const [username, setUsername] = useState(null);
    const [organiserLogo, setOrganiserLogo] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            const data = await pullAccountInfo({accountID: accountID, context: 'organiser'});
            if(data){
                setUsername(data.username);
                setOrganiserLogo(data.organiserLogo);
            } else {
                // Handle null data
            }
        }

        fetchProfileData()
    },[])

    return(
        <View 
            style={{
                width: '90%', 
                flexDirection: 'row',
                margin: '5%', 
                alignItems: 'center'
            }}>
            <Image
                source={{uri: organiserLogo}}
                style={{
                    width: 65, 
                    height: 65, 
                    borderRadius: 10, 
                    objectFit: 'contain',
                    borderWidth: 2,
                    borderColor: GatsbyStyles.gatsbyColours.black
                }}
            />
            <Text style={{fontSize: 20, flexWrap: 'wrap', marginLeft: '10%'}}>
                {username}
            </Text>
        </View>
    )
}