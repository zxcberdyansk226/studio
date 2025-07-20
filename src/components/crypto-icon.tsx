import type { FC } from 'react';

interface CryptoIconProps {
  coin: 'BTC' | 'ETH' | 'SOL';
  className?: string;
}

const icons: Record<CryptoIconProps['coin'], JSX.Element> = {
  BTC: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>Bitcoin</title>
      <path d="M12.373 24a2.23 2.23 0 0 1-1.427-.533l-5.89-4.813a2.33 2.33 0 0 1-.956-1.92V6.266a2.33 2.33 0 0 1 .956-1.92l5.89-4.813a2.23 2.23 0 0 1 2.854 0l5.89 4.813a2.33 2.33 0 0 1 .956 1.92v10.467a2.33 2.33 0 0 1-.956 1.92l-5.89 4.813a2.23 2.23 0 0 1-1.427.534zM7.5 10.42h2.245v3.16h-2.245zm-.001-4.75h2.245v3.16H7.499zm7.502 8.63h2.245v3.16h-2.245zm0-4.75h2.245v3.16h-2.245zm0-4.75h2.245v3.16h-2.245zM4.058 8.83h2.245v3.16H4.058zm0 4.75h2.245v3.16H4.058z" />
    </svg>
  ),
  ETH: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>Ethereum</title>
      <path d="M12 24l-6.22-3.414 6.22-10.773 6.22 10.773L12 24zM12 0l-6.22 15.341L12 9.827l6.22 5.514L12 0z" />
    </svg>
  ),
  SOL: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <title>Solana</title>
      <path d="M3.633 13.332H16.4v3.335H3.633zm0-6.666H16.4v3.334H3.633zm16.734 8.334H7.667v3.333h12.7zM7.667 1.668h12.7v3.334H7.667Z" />
    </svg>
  ),
};

const CryptoIcon: FC<CryptoIconProps> = ({ coin, className = 'h-6 w-6' }) => {
  return <div className={className}>{icons[coin]}</div>;
};

export default CryptoIcon;
