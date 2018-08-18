function finshing(){

}


var ret = finshing.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  console.log(ret);