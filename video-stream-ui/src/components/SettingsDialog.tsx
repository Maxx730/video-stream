import { useContext } from 'react';
import { CloseButton, Dialog, IconButton, Portal, Switch } from '@chakra-ui/react';
import { MdSettings } from 'react-icons/md';
import { SettingsContext } from '@/provider/SettingsProvider';

export const SettingsDialog = () => {
    const { getBoolValue, setBoolValue } = useContext(SettingsContext);

    return (
        <Dialog.Root placement="center">
            <Dialog.Trigger asChild>
                <IconButton aria-label="Settings" variant="outline">
                    <MdSettings />
                </IconButton>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Settings</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Switch.Root
                                display="flex"
                                justifyContent="space-between"
                                width="100%"
                                checked={getBoolValue('holidayLights')}
                                onCheckedChange={(e) => setBoolValue('holidayLights', e.checked)}
                            >
                                <Switch.Label>Holiday lights</Switch.Label>
                                <Switch.HiddenInput />
                                <Switch.Control />
                            </Switch.Root>
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" aria-label="Close settings" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
