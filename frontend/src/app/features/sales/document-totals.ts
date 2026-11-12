export function money(value:number):number {
 return Math.sign(value)*Math.round((Math.abs(value)+Number.EPSILON*Math.max(1,Math.abs(value)))*100)/100;
}

export function documentTotals(lines:readonly {quantity:number;price:number;discount:number;taxRate:number}[], included:boolean, assumed:boolean) {
 const calculated=lines.map(line=>{
   const subtotal=money(line.quantity*line.price);
   const tax=money((subtotal-line.discount)*line.taxRate/(included?100+line.taxRate:100));
   return {subtotal,discount:line.discount,tax,total:money(subtotal-line.discount+(assumed?-tax:included?0:tax))};
 });
 return calculated.reduce((sum,line)=>({subtotal:money(sum.subtotal+line.subtotal),discount:money(sum.discount+line.discount),tax:money(sum.tax+line.tax),total:money(sum.total+line.total)}),{subtotal:0,discount:0,tax:0,total:0});
}
