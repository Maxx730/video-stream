export const getSizeValue = (size: string = 'Normal') => {
    switch (size) {
        case 'Small':
            return '640px'
        case 'Normal':
            return '854px'
        case 'Large':
            return '1138px'
        case 'Huge':
            return '1280px'
        default:
            return '1138px'
    }
}