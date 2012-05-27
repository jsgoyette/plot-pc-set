var notenames = {'g##':9, 'a':9, 'bbb':9, 'a#':10, 'bb':10, 'a##':11, 
		'b':11, 'cb':11, 'b#':0, 'c':0, 'dbb': 0, 'c#':1, 'db':1, 'c##':2, 
		'd':2, 'd#':3, 'eb':3, 'e':4, 'fb':4, 'e#':5, 'f':5, 'gbb':5,
		'f#':6, 'gb':6, 'f##':7, 'g':7, 'abb':7, 'g#':8, 'ab':8};

var compressed = false;
function numOrdA(a, b){ return (a-b); }

function pcstr2pcs(pstr) {
	pstr = pstr.replace(/,/g," ");
	pstr = pstr.replace(/_/g," ");
	if (compressed) pstr = pstr.replace(/(.)/g,'$1 ')
	pstr = pstr.replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');
	if (pstr == "") return new Array();
//alert(pstr);
	return pstr.split(' ');
}

function bin2pcs(bin)
{
	var temp = parseInt(bin);
	var arr = new Array();
	if (!bin) return arr;
	while (temp > 0) {
		var i = 0;
		while (Math.pow(2, i) <= temp)
		{ i++; }
		i -= 1;
		temp -= Math.pow(2, i);
		arr.push(i);
	}
	arr.sort(numOrdA);
	return arr;
}

function pcs2bin(m, arr) {
	var mod = parseInt(m);
	var val = 0;
	var outarr = new Array();
	for (x in arr) {
		if (mod == 12 && !compressed && notenames[arr[x].toLowerCase()] != undefined)
		{
			arr[x] = notenames[arr[x].toLowerCase()];
		}
		if (mod == 12 && compressed)
		{
			if (arr[x] == 't' || arr[x] == 'T') arr[x] = 10;
			if (arr[x] == 'e' || arr[x] == 'E') arr[x] = 11;
		}
	  if (!isNaN(arr[x])) { 
	    outarr.push(arr[x]); 
	  }
	}
	for (x in outarr) {
	  outarr[x] = Math.floor(outarr[x]);
	  while (outarr[x]*1 >= mod) 
		outarr[x] -= mod;
	}
	outarr = unique(outarr);
	for (x in outarr) {
		val += Math.pow(2, outarr[x]);
	}
	return val;
}

function bin2pcs_write() {
	var decs = document.getElementById("decimals").value;
	var arr = bin2pcs(decs);
	if (compressed) {
	  for (x in arr) {
	    if (arr[x]==10) arr[x]='t';
	    if (arr[x]==11) arr[x]='e';
	  }
	}
	var str = compressed? arr.join('') : arr.join(' ');
	var txtBox=document.getElementById("pcs_str");
	txtBox.value = str;
//	if (txtBox!=null ) txtBox.focus();
}

function pcs2bin_write() {
	var pcs = document.getElementById("pcs_str").value.trim();
	var mod = document.getElementById("modulo").value;
	if (mod == "") return 0;
	arr = pcstr2pcs(pcs);
	var val = pcs2bin(mod, arr);
	if (!pcs.length) val = 0;
	var txtBox=document.getElementById("decimals");
	txtBox.value = val;
	//if (txtBox!=null ) txtBox.focus();
}

function clear_screen() {
	document.getElementById("ans").innerHTML = null;
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