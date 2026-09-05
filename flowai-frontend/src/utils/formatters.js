export const formatMoney=(amount=0,currency="USD")=>new Intl.NumberFormat("en-US",{style:"currency",currency}).format(amount/100);
export const formatDate=(value)=>value?new Date(value).toLocaleString():"—";
