export function getNetworkFlag(networkType: string): string | null {
    return networkType === 'mainnet' ? '--mainnet' : networkType === 'preview' ? '--testnet-magic 2' : '--testnet-magic 1';
}

export function getDatumFlag(datumType: string, datumPath: string): string | null {
    return datumType === 'Inline' ? '--tx-in-inline-datum-present' : `--tx-in-datum-file ${datumPath}`;
}
