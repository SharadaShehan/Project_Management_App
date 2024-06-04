import React from 'react';
import { View, Text, Button, Image, TouchableOpacity } from 'react-native';
import { UserGlobalState } from '../layout/UserState';
import { color } from 'react-native-elements/dist/helpers';

const ProfileScreen = ({ navigation }) => {
    const { userData, setUserData } = UserGlobalState();

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={{ alignItems: 'center', marginTop: '10%' }}>
                    <Image source={userData.imageURL ? { uri: userData.imageURL } : require('../../images/profile.webp')} style={{ width: 150, height: 150, borderRadius: 75 }} />
                    <Text style={styles.fullNameText}>{userData.firstName} {userData.lastName}</Text>
                    <View style={styles.topicValueContainer}>
                        <Text style={styles.topicText}>Username : </Text>
                        <Text style={userData.username ? styles.valueText : styles.valueNotSetText}>{userData.username ? userData.username : 'Not set'}</Text>
                    </View>
                    <View style={styles.topicValueContainer}>
                        <Text style={styles.topicText}>Gender : </Text>
                        <Text style={userData.gender ? styles.valueText : styles.valueNotSetText}>{userData.gender ? userData.gender : 'Not set'}</Text>
                    </View>
                    <View style={styles.topicValueContainer}>
                        <Text style={styles.topicText}>Country : </Text>
                        <Text style={userData.country ? styles.valueText : styles.valueNotSetText}>{userData.country ? userData.country : 'Not set'}</Text>
                    </View>
                    { (userData.primaryEmail || userData.secondaryEmail) && <Text style={styles.emailTopicText}>Email Addresses</Text>}
                    { userData.primaryEmail &&
                        <View style={styles.topicValueContainer}>
                            <Text style={userData.primaryEmail ? styles.valueText : styles.valueNotSetText}>{userData.primaryEmail ? userData.primaryEmail : 'Not set'}</Text>
                        </View>
                    }
                    { userData.secondaryEmail &&
                        <View style={styles.topicValueContainer}>
                            <Text style={userData.secondaryEmail ? styles.valueText : styles.valueNotSetText}>{userData.secondaryEmail ? userData.secondaryEmail : 'Not set'}</Text>
                        </View>
                    }
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity title='update profile' onPress={() => navigation.navigate('UpdateProfile')} style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Update Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity title='change password' onPress={() => navigation.navigate('ChangePassword')} style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Change Password</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '93%',
        borderRadius: 40,
        backgroundColor: 'white',
        paddingHorizontal: '4%',
    },
    fullNameText: {
        fontSize: 28,
        marginTop: '5%',
        textAlign: 'center',
        // color: '#007BFF',
        fontWeight: 'bold',
    },
    topicValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '3%',
    },
    topicText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emailTopicText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: '5%',
    },
    valueText: {
        fontSize: 18,
        fontWeight: 'semi-bold',
        color: '#555',
    },
    valueNotSetText: {
        fontSize: 18,
        color: 'gray',
    },
    buttonsContainer: {
        marginTop: '3%',
    },
    updateButton: {
        backgroundColor: '#007BFF',
        marginTop: '4%',
        borderRadius: 8,
        padding: 8
    },
    updateButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    }
}


export default ProfileScreen;