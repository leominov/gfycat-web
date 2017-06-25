/* Copyright (C) GfyCat, Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
* Date: 12/1/2015
*/

angular.module('gfycat.shared').factory('albumEditor', ['$http', 'gfyAccountTree','accountService',
    function($http, gfyAccountTree, accountService) {
        return {
            changeOfAlbumInfo: function (file) {
                file.saved = null;
                this.clearAlbumErrors(file);
            },
            isErrorSavingUsersAlbumInfo: function (file) {
                return (file.errorTitleSave || file.errorTag1Save || file.errorTag2Save || file.errorTag3Save || file.errorDescriptionSave || file.errorNSFWSave || file.errorCommentsSave || file.errorPublishSave || file.errorOrderSave);
            },
            savingUsersAlbumInfo: function (file) {
                return (file.titleSaving || file.tag1Saving || file.tag2Saving || file.tag3Saving || file.descriptionSaving || file.NSFWSaving || file.commentsSaving || file.publishSaving || file.orderSaving);
            },
            clearAlbumErrors: function (file) {
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
            saveUsersAlbumInfo: function (file) {
                //clear error states before trying to save
                this.clearAlbumErrors(file);
                var thisScope = this;

                function saveTitle() {
                    file.saved = false;
                    file.titleSaving = true;
                    //var data = {};
                    //data['folderId'] = file.id;
                    //data['folderName'] = file.usersAlbumTitle;
                    //data['value'] = file.usersAlbumTitle;
                    accountService.albumService.renameAlbum(file.id,file.usersAlbumTitle).then(function (data2) {
                        //console.log("changeName status:" + status);
                        //console.log(data2);
                        gfyAccountTree.getUserAlbums().then(function (data) {
                            //$scope.accountTree.update(data);//load new folders list
                            //$scope.resetCurrentSearch();
                            //var data3 = $scope.findIdInArray(data, id); // need to find the parent data again in the new array we just got back
                            //$scope.setFolderChildren(data3);

                            file.usersAlbumTitleTemp = file.usersAlbumTitle;
                            if (data.error != undefined) {
                                file.errorTitleSave = true;
                                file.errorMsg.push('Title: ' + data2.error);
                                file.usersAlbumTitleTemp = null;
                            } else gfyAccountTree.update(data);//load new folders list
                            file.titleSaving = false;
                            file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                            if (data.newLinkText != undefined) file.linkText = data.newLinkText;

                        });

                    }, function(){
                        file.titleSaving = false;
                        file.errorTitleSave = true;
                        file.errorMsg.push('<Title: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    });
                }
                function idAlbumTag(tagNumber){
                    if (file['usersAlbumTag' + tagNumber] == undefined && file['tag' + tagNumber] != undefined) { // deleting
                        return [tagNumber, 'deleted'];
                    }else if (file['usersAlbumTag' + tagNumber] != undefined) {
                        if (file['tag' + tagNumber] != undefined && (file['tag' + tagNumber] != file['usersAlbumTag' + tagNumber])){ // changing
                            return [tagNumber, 'changing'];
                        }

                        if (file['tag' + tagNumber] == undefined) { // adding
                            return [tagNumber, 'adding'];
                        }
                    }
                    return false;
                }
                function tagErrorOut(tagNumber){
                    file['errorTag' + tagNumber + 'Save'] = true;
                    file['tag'+item[1]+'Saving'] = false;
                    file.errorMsg.push('Tag' + tagNumber + ': Server Error- Try Again');
                }
                function displayTagsErrorOut(){
                    var arr =[1,2,3].map(idAlbumTag).filter(function(item){return item != false;});
                    arr.map(function(item){tagErrorOut(item[0]);});
                }
                function saveTags() {
                    var tags = [[file.usersAlbumTag1,1], [file.usersAlbumTag2,2], [file.usersAlbumTag3,3]].filter(function (item) {
                        if(item[0] == ''){
                            return false;
                        }else if( item[0] == undefined){
                            return false;
                        }
                        file['tag'+item[1]+'Saving'] = true;
                        return true;
                    });
                    var tagsToSend = [];
                    if(tags.length<4 && tags.length>0) {
                        tagsToSend = tags.map(function(item){return item[0]});
                    }
                    else if (tags.length<=0){
                        tagsToSend = [];
                    }
                    accountService.albumService.saveTags(file.id, tagsToSend).then(function () {
                        file.tag1Saving = false;
                        file.tag2Saving = false;
                        file.tag3Saving = false;
                        file.tag1 = file.usersAlbumTag1;
                        file.tag2 = file.usersAlbumTag2;
                        file.tag3 = file.usersAlbumTag3;
                        file.saved = !thisScope.savingUsersAlbumInfo(file);
                    },function () {
                        displayTagsErrorOut();
                        file.saved = !thisScope.savingUsersAlbumInfo(file);
                    });
                }
                function saveDescription() {
                    file.saved = false;
                    file.descriptionSaving = true;
                    if (file.usersDescription == '') {
                        accountService.albumService.deleteDescription(file.id).then(function (data2) {
                            file.usersDescriptionTemp = file.usersDescription;
                            if (data2.error != undefined) {
                                file.errorDescriptionSave = true;
                                file.errorMsg.push('Description: ' + data2.error);
                                file.usersDescriptionTemp = null;
                            }
                            file.descriptionSaving = false;
                            file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                        },function () {
                            file.descriptionSaving = false;
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                        });
                    } else {
                        accountService.albumService.saveDescription(file.id,file.usersDescription).then(function (data2) {
                            file.usersDescriptionTemp = file.usersDescription;
                            if (data2.error != undefined) {
                                file.errorDescriptionSave = true;
                                file.errorMsg.push('Description: ' + data2.error);
                                file.usersDescriptionTemp = null;
                            }
                            file.descriptionSaving = false;
                            file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                        },function () {
                            file.descriptionSaving = false;
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                        });
                    }
                }
                function saveNsfw() {
                    file.saved = false;
                    file.NSFWSaving = true;
                    var nsfw = 3;
                    if (file.usersAlbumNsfw == 'Clean') nsfw = 0;
                    if (file.usersAlbumNsfw == 'Porn') nsfw = 1;
                    if (file.usersAlbumNsfw == 'NSFW') nsfw = 3;

                    accountService.albumService.saveNsfw(file.id,nsfw).then(function (data2) {
                        file.usersAlbumNsfwTemp = file.usersAlbumNsfw;
                        if (data2.error != undefined) {
                            file.errorNSFWSave = true;
                            file.errorMsg.push('nsfw: ' + data2.error);
                            file.usersAlbumNsfwTemp = null;
                        }
                        file.NSFWSaving = false;
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    },function () {
                        file.NSFWSaving = false;
                        file.errorNSFWSave = true;
                        file.errorMsg.push('nsfw: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    });
                }
                function savePublished() {
                    file.saved = false;
                    file.publishSaving = true;
                    var published = 0;
                    if (file.usersAlbumPublish == true) published = 1; // using 1 or 0
                    else published = 0;

                    accountService.albumService.savePublished(file.id, published).then(function (data2) {
                        file.usersAlbumPublishTemp = file.usersAlbumPublish;
                        if (data2.error != undefined) {
                            file.errorPublishSave = true;
                            file.errorMsg.push('Publish: ' + data2.error);
                            file.usersAlbumPublishTemp = null;
                        }
                        file.publishSaving = false;
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    },function () {
                        file.publishSaving = false;
                        file.errorPublishSave = true;
                        file.errorMsg.push('Publish: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    });
                }
                function isOrderChanged() {
                    if (file.publishedGfys != undefined && file.publishedGfys.length != undefined) {
                        var length = file.publishedGfys.length;
                        for (var i = 0; i < length; i++) {
                            if (file.publishedGfys[i].gfyNumber != file.albumOrder[i]) {
                                return true;
                            }
                        }
                    }
                }
                function saveOrder() {
                    file.albumOrder = [];
                    for (i = 0; i < file.publishedGfys.length; i++) {
                        file.albumOrder.push(file.publishedGfys[i].gfyId);
                    }

                    file.saved = false;
                    file.orederSaving = true;

                    accountService.albumService.saveOrder(file.id, file.albumOrder).then(function (data2) {
                        if (data2.error != undefined) {
                            file.errorOrderSave = true;
                            file.errorMsg.push('Order: ' + data2.error);
                        }
                        file.orderSaving = false;
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    },function () {
                        file.orderSaving = false;
                        file.errorOrderSave = true;
                        file.errorMsg.push('Order: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersAlbumInfo(file); // last one out closes the door
                    });
                }

                function shouldSaveTags(sysTag1, sysTag2, sysTag3, userTag1, userTag2, userTag3){
                    return (!(sysTag1 == userTag1 && sysTag2 == userTag2 && sysTag3 == userTag3));
                }
                //decision functions when to save
                if (file.usersAlbumTitle != file.usersAlbumTitleTemp) { saveTitle(); }
                if (file.usersDescription != file.usersDescriptionTemp) { saveDescription();}
                if (shouldSaveTags(file.tag1,file.tag2,file.tag3,file.usersAlbumTag1, file.usersAlbumTag2, file.usersAlbumTag3)) { saveTags();}
                if (file.usersAlbumNsfw != file.usersAlbumNsfwTemp) { saveNsfw();}
                if (file.usersAlbumPublish != file.usersAlbumPublishTemp) { savePublished();}
                if (isOrderChanged()) { saveOrder();}
            }
        }
    }]);