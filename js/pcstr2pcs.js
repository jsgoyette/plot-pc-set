// This script turns a string into an array of pitch classes. If necessary, note names are 
// converted into numeric pitch classes.

var notenames = {'g##':9, 'a':9, 'bbb':9, 'a#':10, 'bb':10, 'a##':11, 
    'b':11, 'cb':11, 'b#':0, 'c':0, 'dbb': 0, 'c#':1, 'db':1, 'c##':2, 
    'd':2, 'd#':3, 'eb':3, 'e':4, 'fb':4, 'e#':5, 'f':5, 'gbb':5,
    'f#':6, 'gb':6, 'f##':7, 'g':7, 'abb':7, 'g#':8, 'ab':8};

var compressed = false;
function numOrdA(a, b){ return (a-b); }

function pcstr2pcs(mod, pstr) {
  var val = 0;
  var outarr = [];
  pstr = pstr.replace(/,/g," ");
  pstr = pstr.replace(/_/g," ");
  if (compressed) pstr = pstr.replace(/(.)/g,'$1 ')
  pstr = pstr.replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');
  if (pstr == "") return [];
  var arr = pstr.split(' ');
  for (x in arr) {
    if (mod == 12 && !compressed && notenames[arr[x].toLowerCase()] != undefined) {
      arr[x] = notenames[arr[x].toLowerCase()];
    }
    if (mod == 12 && compressed) {
      if (arr[x].toLowerCase() == 't') arr[x] = 10;
      if (arr[x].toLowerCase() == 'e') arr[x] = 11;
    }
    if (!isNaN(arr[x])) { 
      outarr.push(arr[x]); 
    }
  }
  for (x in outarr) {
    outarr[x] = Math.floor(outarr[x]);
    while (outarr[x]*1 >= mod) 
      outarr[x] -= mod;
    while (outarr[x]*1 < 0) 
      outarr[x] += mod;
  }
//  outarr.sort(numOrdA);
//  outarr = unique(outarr);
  return outarr;
}

/**
 * Removes duplicates in the array 'a'
 * @author Johan Känngård, http://dev.kanngard.net
 */
function unique(a) {
  tmp = new Array(0);
  for(i=0;i<a.length;i++){
    if(!contains(tmp, a[i])){
      tmp.length+=1;
      tmp[tmp.length-1]=a[i];
    }
  }
  return tmp;
}
/**
 * Returns true if 's' is contained in the array 'a'
 * @author Johan Känngård, http://dev.kanngard.net
 */
function contains(a, e) {
  for(j=0;j<a.length;j++)if(a[j]==e)return true;
  return false;
}