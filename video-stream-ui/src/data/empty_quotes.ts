export interface MovieQuote {
    quote: string,
    source: string
};

export const Quotes: Array<MovieQuote> = [
    {
        quote: "TEST",
        source: "TESTING"
    }
]

export const getRandomQuote = (source: MovieQuote[]): MovieQuote => {
    const lower = Math.ceil(0);
    const upper = Math.floor(source.length - 1);
    return Quotes[Math.floor(Math.random() * (upper - lower + 1)) + lower];
}