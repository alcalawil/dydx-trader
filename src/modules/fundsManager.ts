 const { BigNumber } = require('@dydxprotocol/solo');

module.exports = (solo) => async (account) => {
  const balances = await solo.api.getAccountBalances({ accountOwner: account });
  const eth = solo.web3.utils.fromWei(new BigNumber(balances.balances['0'].wei).toFixed(0));
  const dai = solo.web3.utils.fromWei(new BigNumber(balances.balances['1'].wei).toFixed(0));
  
  return {
    eth,
    dai
  };
};