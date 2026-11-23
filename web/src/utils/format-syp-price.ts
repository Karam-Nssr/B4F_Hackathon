const formatSypPrice = (amount: number): string =>
  Math.trunc(amount / 100).toLocaleString("en-US");

export default formatSypPrice;
