import { gql, useQuery, useMutation } from '@apollo/client';
import { Text, View, Button } from 'react-native';
import { useState } from 'react';

const SIGNIN_MUTATION = gql`
    mutation signIn($username: String!, $password: String!) {
        signIn(username: $username, password: $password) {
            firstName
        }
    }
`;

const SIGNOUT_MUTATION = gql`
    mutation signOut {
        signOut
    }
`;

signInData = {
    username:"SamC",
    password:"Banana@1234"
}

function Basic() {
    const [signOutMutation] = useMutation(SIGNOUT_MUTATION);
    const [signInMutation, { data, loading, error }] = useMutation(SIGNIN_MUTATION);
    const [ firstName, setFirstName ] = useState(null);

    // signOutMutation()
    // signInMutation({ variables: signInData })
    //     .then(res => console.log(res.data.signIn.firstName))
    //     .catch(err => console.log(err));
    
    return (
        <View>
            <Text>Basic</Text>
            <Button
                onPress={() => {
                    signInMutation({ variables: signInData })
                        .then(res => setFirstName(res.data.signIn.firstName))
                        .catch(err => console.log(err));
                }}
                title="Sign In"
            />
            <Button
                onPress={() => {
                    signOutMutation()
                        .then(res => setFirstName(null))
                        .catch(err => console.log(err));
                }}
                title="Sign Out"
            />
            <Text>{firstName}</Text>
        </View>
    )

}

export default Basic;