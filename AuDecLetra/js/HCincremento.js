// JavaScript Document
//Specify affected tags. Add or remove from list:
   var tgs = new Array( 'body', 'div', 'p','li','img','span');
//Specify spectrum of different font sizes:
   var szs = new Array( '12px','14px','16px','18px','20px','24px','28px' );
   var startSz = 1;
   function ts( trgt,inc ){
       if (!document.getElementById) return 
       var d = document,cEl = null,sz = startSz,i,j,cTags;sz += inc;
       if ( sz < 0 ) sz = 0;
       if ( sz > 9 ) sz = 10;
       startSz = sz;if ( !( cEl = d.getElementById( trgt ) ) ) cEl = d.getElementsByTagName( trgt )[ 0 ];
       cEl.style.fontSize = szs[ sz ];
       for ( i = 0 ; i < tgs.length ; i++ ) {
           cTags = cEl.getElementsByTagName( tgs[ i ] );
           for ( j = 0 ; j < cTags.length ; j++ ) cTags[ j ].style.fontSize = szs[ sz ];
       }
   }
