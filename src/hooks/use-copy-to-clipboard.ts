'use client';

import * as React from 'react';

export function useCopyToClipboard({
    timeout = 2000,
    onCopy
}: {
    timeout?: number;
    onCopy?: () => void;
} = {}) {
    const [isCopied, setIsCopied] = React.useState(false);

    const copyToClipboard = (value: string) => {
        if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
            return;
        }

        if (!value) return;

        // eslint-disable-next-line promise/catch-or-return
        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);

            // eslint-disable-next-line promise/always-return
            if (onCopy) {
                onCopy();
            }

            setTimeout(() => {
                setIsCopied(false);
            }, timeout);
        }, console.error);
    };

    return { isCopied, copyToClipboard };
}
