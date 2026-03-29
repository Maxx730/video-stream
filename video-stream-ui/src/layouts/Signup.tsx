import { Card, Stack, Spinner, Input, Field, Button, Link, HStack, Center, Alert, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from "@/provider/AuthProvider";

export interface SignupProps {
    setScreen: Function
}

export function Signup({ setScreen }: SignupProps) {
    const { register, checkToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<{ message: string } | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        checkToken().then((data: { token: string }) => {
            if (data.hasOwnProperty('token')) {
                window.location.href = '/';
            } else {
                setLoading(false);
            }
        }).catch(() => {});
    }, []);

    const handleRegister = async () => {
        setError(null);
        if (password !== confirmPassword) {
            setError({ message: 'Passwords do not match' });
            return;
        }
        if (password.length < 6) {
            setError({ message: 'Password must be at least 6 characters' });
            return;
        }
        setLoading(true);
        const response = await register(email, password);
        if (response?.status === 201) {
            setSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.href = '/login';
        } else {
            setError({ message: response?.error || 'Registration failed' });
        }
        setLoading(false);
    };

    const renderError = () => (
        <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Registration Error</Alert.Title>
                <Alert.Description>{error?.message}</Alert.Description>
            </Alert.Content>
        </Alert.Root>
    );

    const renderSuccess = () => (
        <Alert.Root status="success">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>Account Created</Alert.Title>
                <Alert.Description>Redirecting to sign in...</Alert.Description>
            </Alert.Content>
        </Alert.Root>
    );

    const renderForm = () => (
        <Card.Body gap={4}>
            <Card.Title>
                {error && renderError()}
                {success && renderSuccess()}
            </Card.Title>
            <Card.Description>
                <Stack gap={4}>
                    <Stack gap={4}>
                        <Field.Root required>
                            <Field.Label>
                                Email <Field.RequiredIndicator />
                            </Field.Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} />
                        </Field.Root>
                        <Field.Root required>
                            <Field.Label>
                                Password <Field.RequiredIndicator />
                            </Field.Label>
                            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
                            <Field.HelperText>Minimum 6 characters.</Field.HelperText>
                        </Field.Root>
                        <Field.Root required>
                            <Field.Label>
                                Confirm Password <Field.RequiredIndicator />
                            </Field.Label>
                            <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </Field.Root>
                    </Stack>
                    <Stack>
                        <Button onClick={handleRegister}>
                            Create Account
                        </Button>
                        <Center>
                            <HStack gap={1}>
                                <Text fontSize="sm">Already have an account?</Text>
                                <Link fontSize="sm" onClick={() => { window.location.href = '/login'; }}>Sign In</Link>
                            </HStack>
                        </Center>
                    </Stack>
                </Stack>
            </Card.Description>
        </Card.Body>
    );

    const renderLoading = () => (
        <Card.Body>
            <Center>
                <Spinner />
            </Center>
        </Card.Body>
    );

    return (
        <Center minH="100vh">
            <Card.Root width={360}>
                {loading ? renderLoading() : renderForm()}
            </Card.Root>
        </Center>
    );
}
