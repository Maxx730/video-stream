export const getSizeValue = (size: string = 'Normal', add: number = 0) => {
    switch (size) {
        case 'Small':
            return `${640 + add}px`;
        case 'Normal':
            return `${864 + add}px`;
        case 'Large':
            return `${1138 + add}px`;
        case 'Huge':
            return `${1280 + add}px`;
        default:
            return `${864 + add}px`;
    }
}