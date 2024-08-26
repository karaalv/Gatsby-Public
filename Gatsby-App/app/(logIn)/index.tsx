/* Import utilities. */
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* Import Custom Styles */
import * as GatsbyStyles from '../../styles/gatsbyStyles';

/**
 * Landing page for application.
 * @returns Log in page 
 */
export default function SignUp() {
  // Hook for safe screen area.
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      paddingLeft: insets.left,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingRight: insets.right,
      backgroundColor: GatsbyStyles.gatsbyColours.white,
      flex: 1
    }}>

      <View style={styles.container}>

        {/* Gatsby Logo */}
        <View style={{marginBottom: '5%'}}>
          <Image
            source={require('../../assets/Branding/Title.png')}
            style={{width: 175, height: 125, objectFit:'contain'}}
          />
        </View>

        {/* Log in / Account creation buttons */}
        <View style={styles.buttonContainer}>
          {/* Log in */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('onboarding/logIn')}>
              <Text style={styles.text}>Log in</Text>
            </TouchableOpacity>
          {/* Create User Account */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('onboarding/userOnboarding')}>
              <Text style={styles.text}>Create User Account</Text>
            </TouchableOpacity>
          {/* Create Organiser Account button */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('onboarding/organiserOnboarding')}>
              <Text style={styles.text}>Create Organiser Account</Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}
/* Page Styles. */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: '25%',
    width: '100%',
    height: 'auto',
    maxHeight: '75%'
  },
  button: {
    width: '80%',
    height: 60,
    margin: '7%',
    borderWidth: 3,
    borderRadius: 10,
    justifyContent: 'center'
  },
  text:{
    alignSelf: 'center', 
    fontSize: 18, 
    fontWeight: '500'
  },
  buttonContainer: {
    height: 'auto',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
});

