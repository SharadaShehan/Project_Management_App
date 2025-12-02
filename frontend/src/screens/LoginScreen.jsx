import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserGlobalState } from '../layout/UserState';
import { signIn, confirmSignUp, signOut } from 'aws-amplify/auth';
import { useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE_QUERY } from '../graphql/Queries';
import { Button, TextInput, Card, LoadingSpinner } from '../components';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const LoginScreen = ({ navigation }) => {
  const { userData, setUserData } = UserGlobalState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [getUserProfile] = useLazyQuery(GET_USER_PROFILE_QUERY);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password && !showVerification) {
      newErrors.password = 'Password is required';
    } else if (password && password.length < 8 && !showVerification) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (showVerification && !verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

try {
      if (showVerification) {
        // Verify the account
        await confirmSignUp({
          username: email,
          confirmationCode: verificationCode
        });
        
        Alert.alert('Success', 'Account verified! You can now login.');
        setShowVerification(false);
        setVerificationCode('');
        setLoading(false);
        return;
      }
      
      console.log('Attempting sign in with email:', email);
      
      // Sign in with Cognito using email as username
      let signInResult;
      try {
        signInResult = await signIn({ 
          username: email.trim().toLowerCase(), 
          password,
          options: {
            authFlowType: 'USER_PASSWORD_AUTH'
          }
        });
        console.log('Sign in result:', signInResult);
      } catch (signInError) {
        // If user is already authenticated, sign them out first and retry
        if (signInError.name === 'UserAlreadyAuthenticatedException') {
          console.log('User already signed in, signing out first...');
          await signOut();
          signInResult = await signIn({ 
            username: email.trim().toLowerCase(), 
            password,
            options: {
              authFlowType: 'USER_PASSWORD_AUTH'
            }
          });
          console.log('Sign in result after sign out:', signInResult);
        } else {
          console.error('SignIn specific error:', signInError);
          console.error('SignIn error details:', JSON.stringify(signInError, null, 2));
          throw signInError;
        }
      }
      const { isSignedIn } = signInResult;
      console.log('Is signed in:', isSignedIn);
      
      if (isSignedIn) {
        console.log('Fetching user profile...');
        // Fetch user profile from backend
        try {
          const profileResult = await getUserProfile();
          console.log('Profile result:', profileResult);
          const { data, error } = profileResult;
          
          if (error) {
            console.error('GraphQL error:', error);
            Alert.alert('Error', 'Failed to fetch user profile: ' + (error.message || 'Unknown error'));
            setLoading(false);
            return;
          }
          
          if (data?.me) {
            setUserData({
              id: data.me.id,
              username: data.me.username,
              firstName: data.me.firstName,
              lastName: data.me.lastName,
              gender: data.me.gender,
              country: data.me.country,
              primaryEmail: data.me.primaryEmail,
              secondaryEmail: data.me.secondaryEmail,
              imageURL: data.me.imageURL,
              wsToken: data.me.wsToken,
            });
            navigation.navigate('Home');
          } else {
            Alert.alert('Profile Not Found', 'Your user profile was not found. Please contact support.');
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          Alert.alert('Error', 'Failed to load profile: ' + (profileError.message || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Login error full:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Check if user is not confirmed
      if (err.name === 'UserNotConfirmedException') {
        Alert.alert('Account Not Verified', 'Please enter the verification code sent to your email.');
        setShowVerification(true);
      } else {
        Alert.alert('Login Failed', err.message || err.toString() || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="lock-outline" size={48} color={colors.primary.main} />
            </View>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <Card style={styles.formCard}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<MaterialIcons name="email" size={20} color={colors.neutral[500]} />}
            error={errors.email}
          />
          
          {!showVerification && (
            <TextInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              leftIcon={<MaterialIcons name="lock" size={20} color={colors.neutral[500]} />}
              error={errors.password}
            />
          )}

          {showVerification && (
            <TextInput
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={(text) => {
                setVerificationCode(text);
                setErrors({ ...errors, verificationCode: '' });
              }}
              keyboardType="number-pad"
              leftIcon={<MaterialIcons name="verified" size={20} color={colors.neutral[500]} />}
              error={errors.verificationCode}
            />
          )}

          <Button
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={styles.loginButton}
          >
            {showVerification ? 'Verify Account' : 'Sign In'}
          </Button>

          <Button
            onPress={() => navigation.navigate('SignUp')}
            variant="ghost"
            size="md"
            fullWidth
            style={styles.signUpButton}
          >
            Don't have an account? Sign Up
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 0,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
});

export default LoginScreen;
