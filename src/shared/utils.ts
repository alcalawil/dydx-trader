export const calculatePrice = ({
  makerMarket,
  takerMarket,
  makerAmount,
  takerAmount
}: {
  makerMarket: number;
  takerMarket: number;
  makerAmount: string;
  takerAmount: string;
}) => {
  if (makerMarket === 0) {
    return parseFloat(takerAmount) / parseFloat(makerAmount);
  }

  return parseFloat(makerAmount) / parseFloat(takerAmount);
};
