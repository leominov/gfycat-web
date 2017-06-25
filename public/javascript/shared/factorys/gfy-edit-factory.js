/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/
angular.module('gfycat.shared').factory('gfyEditor', ['$http', 'gfyAccountTree', 'accountService', function($http, gfyAccountTree, accountService) {

    return {
        changeOfInfo: function(file) {
            file.saved = null;

            //console.log(file.saved);
            //console.log("changing info");
            this.clearErrors(file);
        },

        isErrorSavingUsersInfo: function(file) {
            return (file.errorTitleSave || file.errorTag1Save || file.errorTag2Save || file.errorTag3Save || file.errorDescriptionSave || file.errorNSFWSave || file.errorCommentsSave || file.errorPublishSave);
        },

        savingUsersInfo: function(file) {
            return (file.titleSaving || file.tag1Saving || file.tag2Saving || file.tag3Saving || file.descriptionSaving || file.NSFWSaving || file.commentsSaving || file.publishSaving);
        },

        clearErrors: function(file) {
            file.errorTitleSave = false;
            file.errorTag1Save = false;
            file.errorTag2Save = false;
            file.errorTag3Save = false;
            file.errorDescriptionSave = false;
            file.errorNSFWSave = false;
            file.errorCommentsSave = false;
            file.errorPublishSave = false;
            file.errorMsg = [];
        },

        saveUsersInfo: function(file) {
            //clear error states before trying to save
            this.clearErrors(file);
            var thisScope = this;
            function saveTitle() {
                file.saved = false;
                file.titleSaving = true;

                if (file.usersGfyTitle == '') {
                    accountService.deleteGfycatTitle(file.gfyName).then(function (data2) {
                        file.usersGfyTitleTemp = file.usersGfyTitle;
                        if (data2.error != undefined) {
                            file.errorTitleSave = true;
                            file.errorMsg.push('Title: ' + data2.error);
                            file.usersGfyTitleTemp = null;
                        }
                        file.titleSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    },function () {
                        file.titleSaving = false;
                        file.errorTitleSave = true;
                        file.errorMsg.push('Title: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                } else {
                    accountService.setGfycatTitle(file.gfyName, file.usersGfyTitle).then(function (data2) {
                        file.usersGfyTitleTemp = file.usersGfyTitle;
                        if (data2.error != undefined) {
                            file.errorTitleSave = true;
                            file.errorMsg.push('Title: ' + data2.error);
                            file.usersGfyTitleTemp = null;
                        }

                        file.titleSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }, function () {
                        file.titleSaving = false;
                        file.errorTitleSave = true;
                        file.errorMsg.push('Title: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });

                }
            }
            function saveTags() {

                var tags = [[file.usersGfyTag1,1], [file.usersGfyTag2,2], [file.usersGfyTag3,3]].filter(function (item) {
                    if(item[0] == ''){
                        return false;
                    }else if( item[0] == undefined){
                        return false;
                    }
                    file['tag'+item[1]+'Saving'] = true;
                    return true;
                });
                var updatedTags;
                if(tags.length<4 && tags.length>0) {
                    updatedTags = tags.map(function(item){return item[0]});
                }
                else if (tags.length<=0){
                    updatedTags = [];
                }
                function tagErrorOut(tagNumber){
                    file['errorTag' + tagNumber + 'Save'] = true;
                    file['tag'+item[1]+'Saving'] = false;
                    file.errorMsg.push('Tag' + tagNumber + ': Server Error- Try Again');
                }
                function displayTagsErrorOut(){
                    var arr =[1,2,3].map(idGfyTag).filter(function(item){return item != false;});
                    arr.map(function(item){tagErrorOut(item[0]);});
                }
                function idGfyTag(tagNumber){
                    if (file['usersGfyTag' + tagNumber] == undefined && file['tag' + tagNumber] != undefined) { // deleting
                        return [tagNumber, 'deleted'];
                    }else if (file['usersGfyTag' + tagNumber] != undefined) {
                        if (file['tag' + tagNumber] != undefined && (file['tag' + tagNumber] != file['usersGfyTag' + tagNumber])){ // changing
                            return [tagNumber, 'changing'];
                        }

                        if (file['tag' + tagNumber] == undefined) { // adding
                            return [tagNumber, 'adding'];
                        }
                    }
                    return false;
                }
                function removeHashCharacter(tags) {
                  if (tags && tags.length) {
                    for (var i = 0; i < tags.length; i++) {
                      tags[i] = tags[i].replace(/^#*/, '');
                    }
                  }
                };
                removeHashCharacter(updatedTags);
                file.saved = false;
                accountService.setGfyTags(file.gfyName,updatedTags).then(function () {
                    file.tag1Saving = false;
                    file.tag1 = file.usersGfyTag1;
                    file.tag2 = file.usersGfyTag2;
                    file.tag3 = file.usersGfyTag3;
                    file.tag2Saving = false;
                    file.tag3Saving = false;
                    file.saved = !thisScope.savingUsersInfo(file);
                },function () {
                    displayTagsErrorOut();
                    file.saved = !thisScope.savingUsersInfo(file);

                });

            }
            function saveDescription() {
                file.saved = false;
                file.descriptionSaving = true;
                if (file.usersDescription == '') {
                    accountService.deleteGfycatDescription(file.gfyName).then(function (data2) {
                        file.usersDescriptionTemp = file.usersDescription;
                        if (data2.error != undefined) {
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: ' + data2.error);
                            file.usersDescriptionTemp = null;
                        }
                        file.descriptionSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }, function () {
                        file.descriptionSaving = false;
                        file.errorDescriptionSave = true;
                        file.errorMsg.push('Description: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                } else {
                    //var dataT = {};
                    //dataT['value'] = file.usersDescription;
                    accountService.setGfycatDescription(file.gfyName, file.usersDescription).then(function (data2) {
                        file.usersDescriptionTemp = file.usersDescription;
                        if (data2.error != undefined) {
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: ' + data2.error);
                            file.usersDescriptionTemp = null;
                        }
                        file.descriptionSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }, function () {
                        file.descriptionSaving = false;
                        file.errorDescriptionSave = true;
                        file.errorMsg.push('Description: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                }
            }
            function saveNsfw() {
                file.saved = false;
                file.NSFWSaving = true;
                var nsfwValue;
                if (file.usersGfyNsfw == 'Clean') nsfwValue = 0;
                if (file.usersGfyNsfw == 'Porn') nsfwValue = 1;
                if (file.usersGfyNsfw == 'NSFW') nsfwValue = 3;

                accountService.setGfycatNsfw(file.gfyName,nsfwValue).then(function (data2) {
                    file.usersGfyNsfwTemp = file.usersGfyNsfw;
                    if (data2.error != undefined) {
                        file.errorNSFWSave = true;
                        file.errorMsg.push('nsfw: ' + data2.error);
                        file.usersGfyNsfwTemp = null;
                    }
                    file.NSFWSaving = false;
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                },function () {
                    file.NSFWSaving = false;
                    file.errorNSFWSave = true;
                    file.errorMsg.push('nsfw: Server Error- Try Again');
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                });
            }
            function savePublished() {
                file.saved = false;
                file.publishSaving = true;
                var published = 0;
                if (file.usersGfyPublish == true) published = 1; // using 1 or 0
                else published = 0;

                accountService.setGfycatPublished(file.gfyName, published).then(function (data2) {
                    file.usersGfyPublishTemp = file.usersGfyPublish;
                    if (data2.error != undefined) {
                        file.errorPublishSave = true;
                        file.errorMsg.push('Publish: ' + data2.error);
                        file.usersGfyPublishTemp = null;
                    }

                    file.publishSaving = false;
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                },function () {
                    file.publishSaving = false;
                    file.errorPublishSave = true;
                    file.errorMsg.push('Publish: Server Error- Try Again');
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                });
            }

            if (file.usersGfyTitle != file.usersGfyTitleTemp) { saveTitle(); }


            function shouldSaveTags(sysTag1, sysTag2, sysTag3, userTag1, userTag2, userTag3){
                return (!(sysTag1 == userTag1 && sysTag2 == userTag2 && sysTag3 == userTag3));
            }

            if(shouldSaveTags(file.tag1,file.tag2,file.tag3,file.usersGfyTag1,file.usersGfyTag2, file.usersGfyTag3)){

                saveTags();
            }



            //(file.usersGfyTag1 != undefined || file.usersGfyTag2 != undefined || file.usersGfyTag3 != undefined) //&&
            //&& ((file.tag1 != undefined &&(file.tag1 != file.usersGfyTag1))||
            //(file.tag2 != undefined &&(file.tag2 != file.usersGfyTag2))||
            //(file.tag3 != undefined &&(file.tag3 != file.usersGfyTag3)))
            //) {saveTags(); }
            if (file.usersDescription != file.usersDescriptionTemp) { saveDescription(); }
            if (file.usersGfyNsfw != file.usersGfyNsfwTemp) { saveNsfw(); }
            if (gfyAccountTree.loggedIntoAccount) {
                if (file.usersGfyPublish != file.usersGfyPublishTemp) {
                    savePublished();
                }
            }
        }
    };
}]);
