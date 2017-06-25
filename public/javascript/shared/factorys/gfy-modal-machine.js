/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('gfyModalMachine', function() {

  return {
    // these are the variables used to toggle the initial state to the ON position - toggling off is linked to the variable show inside the modals own directive
    modalDialogShown: false,
    modalUserAccountShown: false,
    modalLoginShown: false,
    modalHowTosShown: false,
    modalUploadsShown: false,
    modalDetailPlayerShown: false,

    anyModalShown: function() {
      return this.modalDialogShown || this.modalUserAccountShown || this.modalLoginShown
        || this.modalHowTosShown || this.modalUploadsShown || this.modalDetailPlayerShown;
    },

    toggleModal: function(whichOne) {
      //console.log("calling toggle modal:" + whichOne);
      switch (whichOne) {
        case 'modalDialogShown':
                {
                  this.modalDialogShown = !this.modalDialogShown;
                  break;
                }

        case 'modalUserAccountShown':
                {
                  this.modalUserAccountShown = !this.modalUserAccountShown;
                  break;
                }

        case 'modalLoginShown':
                {
                  this.modalLoginShown = !this.modalLoginShown;
                  break;
                }

        case 'modalHowTosShown':
                {
                  this.modalHowTosShown = !this.modalHowTosShown;
                  break;
                }

        case 'modalUploadsShown':
                {
                  this.modalUploadsShown = !this.modalUploadsShown;
                  break;
                }
      }
    },

  };

});
