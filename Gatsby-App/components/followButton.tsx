/* Import utilities. */
import { TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import  { useEffect, useRef, useState } from "react";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { FollowingButtonProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from "../firebaseConfig";
import { followUnfollowAccount, isFollowing } from "../scripts/GatsbyFirestoreFunctions";

/**
 * Follow button component for explorable 
 * accounts.
 * @param {FollowingButtonProps} 
 * @returns Following button component
 */
export default function FollowButton({followerID, followerAccountType, followingID, followingAccountType}: FollowingButtonProps){
    // Following state.
    const [isLoading, setIsLoading] = useState(true);
    const [following, setFollowing] = useState(null);
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Fetch following state from firestore.
    useEffect(() => {
        const fetch = async () => {
            const result = await isFollowing({
                followerID: followerID, 
                followingID: followingID, 
                followerAccountType: followerAccountType
            });
            if(result){
                setFollowing(true);
            } else {
                setFollowing(false);
            }
            setIsLoading(false);
        }
        fetch()
    }, []);

    useEffect(() => {
        // Follow animation.
        if(!following){
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
            }).start();
        } else {
            // Unfollow animation.
            Animated.timing(scaleValue, {
                toValue: 1.15,
                duration: 100,
                useNativeDriver: true
            }).start();
        }

    }, [following])

    // Follow. 
    const follow = async () => {
        await followUnfollowAccount({
            followerID: followerID, 
            followerAccountType: followerAccountType, 
            followingID: followingID, 
            followingAccountType: followingAccountType,
            isFollowing: true
        })
        setFollowing(true);
    }

    // Unfollow.
    const unfollow = async () => {
        await followUnfollowAccount({
            followerID: followerID, 
            followerAccountType: followerAccountType, 
            followingID: followingID, 
            followingAccountType: followingAccountType,
            isFollowing: false
        })
        setFollowing(false);
    }

    const doNothing = () => {}

    return(
        <TouchableOpacity style={{width: 100, height: 30, opacity: isLoading? 0.5 : 1}} activeOpacity={0.25} onPress={isLoading? doNothing : following? unfollow : follow }>
            <Animated.View 
                style={[
                    styles.followButtonContainer, 
                    {
                        backgroundColor: following? GatsbyStyles.gatsbyColours.gold: GatsbyStyles.gatsbyColours.grey,
                        transform: [{scale: scaleValue}]
                    }
                ]}>
                <Text
                    style={[
                        styles.followButtonText, 
                        {
                            color: following? GatsbyStyles.gatsbyColours.white: GatsbyStyles.gatsbyColours.black
                        }
                    ]}>
                    {following? `Following`: `Add +` }
                </Text>
            </Animated.View>
        </TouchableOpacity>
    )
}

/* Component Styles */
const styles = StyleSheet.create({
    followButtonContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        padding: 5, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    followButtonText:{
        fontSize: 15,
        fontWeight: '600'
    },
})