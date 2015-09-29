// JavaScript Document
function parentFocus( event ) {
  var e = event || window.event;
  if( e.target )
    e.target.parentNode.className = "focus";
  else
    e.srcElement.parentNode.className = "focus";
}

function parentBlur( event ) {
  var e = event || window.event;  
  var node;
  if( e.target )
    e.target.parentNode.className = "";
  else
    e.srcElement.parentNode.className = "";
}
