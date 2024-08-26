/* Import utilities. */
import { 
    View, StyleSheet, TouchableOpacity, 
    ScrollView, Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import OrganiserNavbar from "../../../../components/organiserNavbar";

/* Import Component Types */

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../styles/gatsbyStyles';

/**
 * Random Data used for demonstrating.
 */
import { getRandomOrganiserAnalytics } from "../../../../scripts/GatsbyFirestoreFunctions";
const analyticsData = getRandomOrganiserAnalytics();

/**
 * This page allows as an organiser to 
 * view account analytics.
 *
 * @returns Organiser Analytics page (Home).
 */
export default function OrganiserHome(){
    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for  scroll view.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    /* FIRESTORE */
    const [followers, setFollowers] = useState(analyticsData.followers);
    const [followerGain, setFollowerGain] = useState(analyticsData.deltaFollowers < 0? false : true);
    const [profileVisits, setProfileVisits] = useState(analyticsData.profileVisits);
    const [postLikes, setPostLikes] = useState(analyticsData.postLikes);
    const [deltaFollowers, setDeltaFollowers] = useState(analyticsData.deltaFollowers);
    const [revenue, setRevenue] = useState(analyticsData.revenue);
    // Bar-chart.
    const [month1, setMonth1] = useState(analyticsData.ticketSalesData.month1);
    const [month2, setMonth2] = useState(analyticsData.ticketSalesData.month2);
    const [month3, setMonth3] = useState(analyticsData.ticketSalesData.month3);

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
            {/* Screen content */}
            
            {/* Inbox icon */}
            <TouchableOpacity style={styles.inboxIcon} onPress={() => {router.push('(app)/organiser/(home)/inbox')}}>
                <Image
                    source={require('../../../../assets/Utilities/InboxIcon.png')}
                    style={{height: 40, width: 40, objectFit: 'contain'}}
                />
            </TouchableOpacity>

            {/* Organiser analytics */}
            <ScrollView 
                style={styles.analyticsContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingTop: '20%', paddingBottom: '25%'}}
                onScrollBeginDrag={() => setIsScrolling(true)}
            >
                {/* Title */}
                <Text style={{
                    margin: '7.5%',
                    marginBottom: '2.5%',
                    fontSize: 26, 
                    fontWeight: '700'
                }}>
                    Analytics
                </Text>

                {/* Follower Data */}
                <View style={styles.sectionContainer}> 

                    {/* Current followers number */}
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        height: 'auto',
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            fontSize: 24, 
                            fontWeight: '600',
                        }}>
                            Followers:
                        </Text>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '700',
                            marginLeft: '5%',
                            flexWrap: 'wrap',
                            width: '60%',
                            height: 'auto',
                            color: GatsbyStyles.gatsbyColours.gold,
                        }}>
                            {followers}
                        </Text>
                    </View>

                    {/* Change in followers */}
                    <View style={{
                        margin: '5%',
                        marginTop: '7.5%',
                        flexDirection: 'row',
                        width: '100%',
                        height: 'auto',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 22, 
                            fontWeight: '500'
                        }}>
                            This Month: 
                        </Text>
                        <View style={{
                            marginLeft: '5%',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Image
                                source={
                                    followerGain? 
                                        require('../../../../assets/Utilities/ArrowUpIcon.png')
                                    :
                                        require('../../../../assets/Utilities/ArrowDownIcon.png')
                                }
                                style={{
                                    height: 30, 
                                    width:  30, 
                                    objectFit: 'contain', 
                                    tintColor: followerGain? GatsbyStyles.gatsbyColours.green : GatsbyStyles.gatsbyColours.red
                                }}
                            />
                            <Text style={{
                                fontSize: 22,
                                fontWeight: '700',
                                marginLeft: '2.5%',
                                flexWrap: 'wrap',
                                width: '60%',
                                height: 'auto',
                                color: followerGain? GatsbyStyles.gatsbyColours.green : GatsbyStyles.gatsbyColours.red
                            }}>
                                {deltaFollowers}
                            </Text>
                        </View>
                    </View>

                </View>

                {/* Revenue */}
                <View style={styles.sectionContainer}>

                    {/* Monthly Revenue */}
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        height: 'auto',
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            fontSize: 24, 
                            fontWeight: '600',
                        }}>
                            Revenue:
                        </Text>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '700',
                            marginLeft: '5%',
                            flexWrap: 'wrap',
                            width: '60%',
                            height: 'auto',
                            color: GatsbyStyles.gatsbyColours.gold,
                        }}>
                            {revenue}
                        </Text>
                    </View>

                    {/* Ticket sales plot */}
                    <View style={{
                        margin: '5%'
                    }}>
                        <Text style={{
                            fontSize: 22, 
                            fontWeight: '500',
                            marginBottom: '5%'
                        }}>
                            Ticket Sales: 
                        </Text>

                        {/* Bar chart container */}
                        <View style={{
                            justifyContent:'space-around',
                            flexDirection: 'row',
                            height: 200
                        }}>

                            {/* Month 1 */}
                            <View style={styles.ticketSalesColumn}>
                                {/* Bar Container*/}
                                <View style={styles.ticketSalesBarContainer}>
                                    {/* Bar */}
                                    <View style={[styles.ticketSalesBar, {height: `${month1.proportion}%`}]}>
                                    </View>
                                </View>
                                {/* Label */}
                                <Text style={styles.ticketSalesLabel}>
                                    {month1.month}
                                </Text>
                            </View>

                            {/* Month 2 */}
                            <View style={styles.ticketSalesColumn}>
                                {/* Bar Container*/}
                                <View style={styles.ticketSalesBarContainer}>
                                    {/* Bar */}
                                    <View style={[styles.ticketSalesBar, {height: `${month2.proportion}%`}]}>
                                    </View>
                                </View>
                                {/* Label */}
                                <Text style={styles.ticketSalesLabel}>
                                    {month2.month}
                                </Text>
                            </View>

                            {/* Month 3 */}
                            <View style={styles.ticketSalesColumn}>
                                {/* Bar Container*/}
                                <View style={styles.ticketSalesBarContainer}>
                                    {/* Bar */}
                                    <View style={[styles.ticketSalesBar, {height: `${month3.proportion}%`}]}>
                                    </View>
                                </View>
                                {/* Label */}
                                <Text style={styles.ticketSalesLabel}>
                                    {month3.month}
                                </Text>
                            </View>
                            
                        </View>
                    </View>

                </View>

                {/* Engagement */}
                <View style={styles.sectionContainer}>

                    <Text style={{
                        fontSize: 24, 
                        fontWeight: '600',
                        }}>
                        Monthly Engagement:
                    </Text>

                    {/* Profile visits */}
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        height: 'auto',
                        alignItems: 'center',
                        margin: '5%'
                    }}>
                        <Text style={{
                            fontSize: 22, 
                            fontWeight: '500',
                        }}>
                            Profile visits:
                        </Text>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '700',
                            marginLeft: '5%',
                            flexWrap: 'wrap',
                            width: '60%',
                            height: 'auto',
                            color: GatsbyStyles.gatsbyColours.gold,
                        }}>
                            {profileVisits}
                        </Text>
                    </View>

                    {/* Post likes */}
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        height: 'auto',
                        alignItems: 'center',
                        margin: '5%'
                    }}>
                        <Text style={{
                            fontSize: 22, 
                            fontWeight: '500',
                        }}>
                            Post Likes:
                        </Text>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '700',
                            marginLeft: '5%',
                            flexWrap: 'wrap',
                            width: '60%',
                            height: 'auto',
                            color: GatsbyStyles.gatsbyColours.gold,
                        }}>
                            {postLikes}
                        </Text>
                    </View>

                </View>

            </ScrollView>

            {/* Render Organiser Navigation bar */}
            <OrganiserNavbar
                navigationState='home'
                isParentScrolling={isScrolling}
            />
            
        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    inboxIcon:{
        position: 'absolute',
        right: '5%',
        top: '7.5%',
        width: 40,
        height: 40,
        alignSelf: 'flex-end',
        zIndex: 1
    },
    analyticsContainer:{
        height: '100%',
        width: '100%',
        alignSelf: 'center'
    },
    sectionContainer:{
        alignSelf: 'center',
        margin: '5%',
        padding: '5%',
        width: '90%',
        height: 'auto',
        borderWidth: 3,
        borderRadius: 10
    },
    ticketSalesColumn:{
        flexDirection: 'column',
        height: '100%',
        width: '25%',
    },
    ticketSalesLabel:{
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        margin: '5%',
        height: '10%'
    },
    ticketSalesBarContainer:{
        height: '100%',
        flexDirection: 'column-reverse'
    },
    ticketSalesBar:{
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        borderRadius: 20,
        top: '0%'
    }
})