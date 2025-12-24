import { Card, Stack, Spinner, Input, Field, Button, Link, HStack, Separator, Checkbox, Center, Alert, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from "@/provider/AuthProvider";

export interface LoginProps {
    setScreen: Function
}

export function Login ({ setScreen }: LoginProps) {
    const { login, checkToken, setToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('test.email@gmail.com');
    const [password, setPassword] = useState('testpassword');
    const [error, setError] = useState<{
        status: number,
        message: string
    } | null>();

    const renderLogin = () => {
        return (
            <Card.Body gap={4}>
                <Card.Title>
                    {error && renderError()}
                </Card.Title>
                <Card.Description>
                    <Stack gap={4}>
                        <Stack gap={4}>
                            <Field.Root required>
                                <Field.Label>
                                    Email <Field.RequiredIndicator />
                                </Field.Label>
                                <Input value={email} onChange={val => setEmail(val.target.value)}/>
                                <Field.HelperText>Login email currently manually provided.</Field.HelperText>
                            </Field.Root>
                            <Field.Root>
                                <Field.Label>
                                    Password
                                </Field.Label>
                                <PasswordInput value={password} onChange={val => setPassword(val.target.value)}/>
                            </Field.Root>
                        </Stack>
                        <HStack align={'end'}>
                            <HStack flexGrow={1}>
                                <Checkbox.Root>
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>Remember me</Checkbox.Label>
                                </Checkbox.Root>
                            </HStack>
                            <Link>Forgot Password</Link>
                        </HStack>
                        <Stack>
                            <Button onClick={async () => {
                                setLoading(true);
                                const loginResponse = await login(email, password);
                                if (loginResponse) {
                                    if (loginResponse?.status === 200) {
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                        console.log('working');
                                        setToken(loginResponse.token);
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                        window.location.href = '/';
                                    } else {
                                        setError({
                                            status: loginResponse.status,
                                            message: 'unauthorized'
                                        });
                                    }
                                } else {
                                    setError({
                                        status: 401,
                                        message: 'unauthorized'
                                    });
                                }
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                setLoading(false);
                            }}>
                                Sign In
                            </Button>
                            <HStack>
                                <Separator flex="1" />
                                <Text flexShrink="0">Or</Text>
                                <Separator flex="1" />
                            </HStack>
                            <Center>
                                <Link>
                                    Continue as Guest
                                </Link>
                            </Center>
                        </Stack>                        
                    </Stack>
                </Card.Description>
            </Card.Body>
        );
    }

    const renderError = () => {
        return (
            <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Authentication Error</Alert.Title>
                    <Alert.Description>
                    {error?.message}
                    </Alert.Description>
                </Alert.Content>
            </Alert.Root>
        );
    }

    const renderLoading = () => {
        return (
            <Card.Body>
                <Center>
                    <Spinner/>
                </Center>
            </Card.Body>
        )
    }

    useEffect(() => {
        checkToken().then((data: { token: string }) => {
            if (data.hasOwnProperty('token')) {
                window.location.href = '/';
            } else {
                setLoading(false);
            }
        }).catch(() => {});
    }, []);

    return (
        <Card.Root width={360}>
            {loading ? renderLoading() : renderLogin()}
        </Card.Root>
    )
}