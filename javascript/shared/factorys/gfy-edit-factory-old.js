/* Copyright (C) GfyCat, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Date: 12/1/2015
 */

angular.module('gfycat.shared').factory('gfyEditorOld', ['$http', 'gfyAccountTree', function($http, gfyAccountTree) {

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

            //console.log("save users file info:");
            // save title
            if (file.usersGfyTitle != file.usersGfyTitleTemp) {
                file.saved = false;
                file.titleSaving = true;

                if (file.usersGfyTitle == '') {
                    var dataT = {};
                    dataT['gfyId'] = file.gfyName;

                    //console.log(dataT);
                    $http.post('/ajax/deleteTitle', dataT).success(function(data2) {
                        //console.log("title deleted" + data2);
                        file.usersGfyTitleTemp = file.usersGfyTitle;
                        if (data2.error != undefined) {
                            file.errorTitleSave = true;
                            file.errorMsg.push('Title: ' + data2.error);
                            file.usersGfyTitleTemp = null;
                        }

                        file.titleSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }).error(function(data2) {
                        file.titleSaving = false;
                        file.errorTitleSave = true;
                        file.errorMsg.push('Title: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                }        else {
                    var dataT = {};
                    dataT['title'] = file.usersGfyTitle;
                    dataT['gfyId'] = file.gfyName;

                    //console.log(dataT);
                    $http.post('/ajax/addTitle', dataT).success(function(data2) {
                        //console.log("title saved" + data2);
                        file.usersGfyTitleTemp = file.usersGfyTitle;
                        if (data2.error != undefined) {
                            file.errorTitleSave = true;
                            file.errorMsg.push('Title: ' + data2.error);
                            file.usersGfyTitleTemp = null;
                        }

                        file.titleSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }).error(function(data2) {
                        file.titleSaving = false;
                        file.errorTitleSave = true;
                        file.errorMsg.push('Title: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });

                }
            }

            // save tags
            //console.log(file.usersGfyTag1,file.tag1,file.usersGfyTag2,file.tag2,file.usersGfyTag3,file.tag3);
            if (file.usersGfyTag1 != undefined || file.usersGfyTag2 != undefined || file.usersGfyTag3 != undefined) {
                // check for deleted tags = ''
                if (file.usersGfyTag1 == '') file.usersGfyTag1 = null;
                if (file.usersGfyTag2 == '') file.usersGfyTag2 = null;
                if (file.usersGfyTag3 == '') file.usersGfyTag3 = null;

                // check for double tags
                if (file.usersGfyTag1 == file.usersGfyTag2) file.usersGfyTag2 = null;
                if (file.usersGfyTag1 == file.usersGfyTag3) file.usersGfyTag3 = null;
                if (file.usersGfyTag2 == file.usersGfyTag3) file.usersGfyTag3 = null;

                // next check for empty tags and shift around
                if ((file.usersGfyTag1 == undefined || file.usersGfyTag1 == '') && file.usersGfyTag2 != undefined && file.usersGfyTag2 != '') {
                    file.usersGfyTag1 = file.usersGfyTag2;
                    file.usersGfyTag2 = null;
                }

                if ((file.usersGfyTag1 == undefined || file.usersGfyTag1 == '') && (file.usersGfyTag2 == undefined || file.usersGfyTag2 == '') && file.usersGfyTag3 != undefined && file.usersGfyTag3 != '') {
                    file.usersGfyTag1 = file.usersGfyTag3;
                    file.usersGfyTag3 = null;
                }

                if ((file.usersGfyTag2 == undefined || file.usersGfyTag2 == '') && file.usersGfyTag3 != undefined && file.usersGfyTag3 != '') {
                    file.usersGfyTag2 = file.usersGfyTag3;
                    file.usersGfyTag3 = null;
                }

                //ok now save
                if (file.usersGfyTag1 == undefined) {
                    if (file.tag1 != undefined && (file.tag1 != file.usersGfyTag1)) {
                        file.saved = false;
                        file.tag1Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.tag1;

                        //console.log(dataT);
                        $http.post('/ajax/deleteTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag1 deleted" + data2);
                            file.tag1 = null;
                            if (data2.error != undefined) {
                                file.errorTag1Save = true;
                                file.errorMsg.push('Tag1: ' + data2.error);
                                file.tag1 = dataT.tag;
                            }

                            file.tag1Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag1Saving = false;
                            file.errorTag1Save = true;
                            file.errorMsg.push('Tag1: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }        else if (file.usersGfyTag1 != undefined) {
                    if (file.tag1 != undefined && (file.tag1 != file.usersGfyTag1)) {
                        file.saved = false;
                        file.tag1Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['oldTag'] = file.tag1;
                        dataT['newTag'] = file.usersGfyTag1;

                        //console.log(dataT);
                        $http.post('/ajax/changeTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag1 changed" + data2);
                            file.tag1 = file.usersGfyTag1;
                            if (data2.error != undefined) {
                                file.errorTag1Save = true;
                                file.errorMsg.push('Tag1: ' + data2.error);
                                file.tag1 = dataT.oldTag;
                            }

                            file.tag1Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag1Saving = false;
                            file.errorTag1Save = true;
                            file.errorMsg.push('Tag1: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }

                    if (file.tag1 == undefined) {
                        file.saved = false;
                        file.tag1Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.usersGfyTag1;

                        //console.log(dataT);
                        $http.post('/ajax/addTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag1 saved" + data2);
                            file.tag1 = file.usersGfyTag1;
                            if (data2.error != undefined) {
                                file.errorTag1Save = true;
                                file.errorMsg.push('Tag1: ' + data2.error);
                                file.tag1 = null;
                            }

                            file.tag1Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag1Saving = false;
                            file.errorTag1Save = true;
                            file.errorMsg.push('Tag1: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }

                if (file.usersGfyTag2 == undefined) {
                    if (file.tag2 != undefined && (file.tag2 != file.usersGfyTag2)) {
                        file.saved = false;
                        file.tag2Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.tag2;

                        //console.log(dataT);
                        $http.post('/ajax/deleteTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag2 deleted" + data2);
                            file.tag2 = null;
                            if (data2.error != undefined) {
                                file.errorTag2Save = true;
                                file.errorMsg.push('Tag2: ' + data2.error);
                                file.tag2 = dataT.tag;
                            }

                            file.tag2Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag2Saving = false;
                            file.errorTag2Save = true;
                            file.errorMsg.push('Tag2: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }        else if (file.usersGfyTag2 != undefined) {
                    if (file.tag2 != undefined && (file.tag2 != file.usersGfyTag2)) {
                        file.saved = false;
                        file.tag2Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['oldTag'] = file.tag2;
                        dataT['newTag'] = file.usersGfyTag2;

                        //console.log(dataT);
                        $http.post('/ajax/changeTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag2 changed" + data2);
                            file.tag2 = file.usersGfyTag2;
                            if (data2.error != undefined) {
                                file.errorTag2Save = true;
                                file.errorMsg.push('Tag2: ' + data2.error);
                                file.tag2 = dataT.oldTag;
                            }

                            file.tag2Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag2Saving = false;
                            file.errorTag2Save = true;
                            file.errorMsg.push('Tag2: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }

                    if (file.tag2 == undefined) {
                        file.saved = false;
                        file.tag2Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.usersGfyTag2;

                        //console.log(dataT);
                        $http.post('/ajax/addTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag2 saved" + data2);
                            file.tag2 = file.usersGfyTag2;
                            if (data2.error != undefined) {
                                file.errorTag2Save = true;
                                file.errorMsg.push('Tag2: ' + data2.error);
                                file.tag2 = null;
                            }

                            file.tag2Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag2Saving = false;
                            file.errorTag2Save = true;
                            file.errorMsg.push('Tag2: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }

                if (file.usersGfyTag3 == undefined) {
                    if (file.tag3 != undefined && (file.tag3 != file.usersGfyTag3)) {
                        file.saved = false;
                        file.tag3Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.tag3;

                        //console.log(dataT);
                        $http.post('/ajax/deleteTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag3 deleted" + data2);
                            file.tag3 = null;
                            if (data2.error != undefined) {
                                file.errorTag3Save = true;
                                file.errorMsg.push('Tag3: ' + data2.error);
                                file.tag3 = dataT.tag;
                            }

                            file.tag3Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag3Saving = false;
                            file.errorTag3Save = true;
                            file.errorMsg.push('Tag3: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }        else if (file.usersGfyTag3 != undefined) {
                    if (file.tag3 != undefined && (file.tag3 != file.usersGfyTag3)) {
                        file.saved = false;
                        file.tag3Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['oldTag'] = file.tag3;
                        dataT['newTag'] = file.usersGfyTag3;

                        //console.log(dataT);
                        $http.post('/ajax/changeTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag3 changed" + data2);
                            file.tag3 = file.usersGfyTag3;
                            if (data2.error != undefined) {
                                file.errorTag3Save = true;
                                file.errorMsg.push('Tag3: ' + data2.error);
                                file.tag3 = dataT.oldTag;
                            }

                            file.tag3Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag3Saving = false;
                            file.errorTag3Save = true;
                            file.errorMsg.push('Tag3: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }

                    if (file.tag3 == undefined) {
                        file.saved = false;
                        file.tag3Saving = true;
                        var dataT = {};
                        dataT['gfyId'] = file.gfyName;
                        dataT['tag'] = file.usersGfyTag3;

                        //console.log(dataT);
                        $http.post('/ajax/addTag', dataT).success(function(data2) { // addTag.... changeTag
                            //console.log("tag3 saved" + data2);
                            file.tag3 = file.usersGfyTag3;
                            if (data2.error != undefined) {
                                file.errorTag3Save = true;
                                file.errorMsg.push('Tag3: ' + data2.error);
                                file.tag3 = null;
                            }

                            file.tag3Saving = false;
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        }).error(function(data2) {
                            file.tag3Saving = false;
                            file.errorTag3Save = true;
                            file.errorMsg.push('Tag3: Server Error- Try Again');
                            file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                        });
                    }
                }
            }

            // save description
            if (file.usersDescription != file.usersDescriptionTemp) {
                file.saved = false;
                file.descriptionSaving = true;
                if (file.usersDescription == '') {
                    var dataT = {};
                    dataT['gfyId'] = file.gfyName;

                    //console.log(dataT);
                    $http.post('/ajax/deleteDescription', dataT).success(function(data2) {
                        //console.log("description deleted" + data2);
                        file.usersDescriptionTemp = file.usersDescription;
                        if (data2.error != undefined) {
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: ' + data2.error);
                            file.usersDescriptionTemp = null;
                        }

                        file.descriptionSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }).error(function(data2) {
                        file.descriptionSaving = false;
                        file.errorDescriptionSave = true;
                        file.errorMsg.push('Description: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                }        else {
                    var dataT = {};
                    dataT['description'] = file.usersDescription;
                    dataT['gfyId'] = file.gfyName;

                    //console.log(dataT);
                    $http.post('/ajax/addDescription', dataT).success(function(data2) {
                        //console.log("description saved" + data2);
                        file.usersDescriptionTemp = file.usersDescription;
                        if (data2.error != undefined) {
                            file.errorDescriptionSave = true;
                            file.errorMsg.push('Description: ' + data2.error);
                            file.usersDescriptionTemp = null;
                        }

                        file.descriptionSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }).error(function(data2) {
                        file.descriptionSaving = false;
                        file.errorDescriptionSave = true;
                        file.errorMsg.push('Description: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                }
            }

            // save NSFW
            if (file.usersGfyNsfw != file.usersGfyNsfwTemp) {
                file.saved = false;
                file.NSFWSaving = true;
                var dataT = {};
                dataT['gfyId'] = file.gfyName;
                if (file.usersGfyNsfw == 'Clean') dataT['value'] = 0;
                if (file.usersGfyNsfw == 'Porn') dataT['value'] = 1;
                if (file.usersGfyNsfw == 'NSFW') dataT['value'] = 3;

                //console.log(dataT);
                $http.post('/ajax/setNsfw', dataT).success(function(data2) {
                    //console.log("NSFW saved" + data2);
                    file.usersGfyNsfwTemp = file.usersGfyNsfw;
                    if (data2.error != undefined) {
                        file.errorNSFWSave = true;
                        file.errorMsg.push('nsfw: ' + data2.error);
                        file.usersGfyNsfwTemp = null;
                    }

                    file.NSFWSaving = false;
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                }).error(function(data2) {
                    file.NSFWSaving = false;
                    file.errorNSFWSave = true;
                    file.errorMsg.push('nsfw: Server Error- Try Again');
                    file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                });
            }

            if (gfyAccountTree.loggedIntoAccount) {
                // save comments
                //                        if (file.usersGfyComments != file.usersGfyCommentsTemp) {
                //                            file.saved=false;
                //                            file.commentsSaving = true;
                //                            var dataT = {};
                //                            dataT['gfyId'] = file.gfyName;
                //                            if (file.usersGfyComments==true) dataT['value'] = 1;
                //                            else dataT['value'] = 0;
                //                            console.log(dataT);
                //                            $http.post('/ajax/addComments', dataT).success(function (data2) {
                //                                console.log("comments saved" + data2);
                //                                file.usersGfyCommentsTemp=file.usersGfyComments;
                //                                if (data2.error!=undefined) {
                //                                  file.errorCommentsSave = true;
                //                                  file.errorMsg=file.errorMsg +'<Cmnt: '+data2.error+'>  ';
                //                                  file.usersGfyCommentsTemp=null;
                //                                }
                //                                file.commentsSaving = false;
                //                                file.saved=!thisScope.savingUsersInfo(file); // last one out closes the door
                //                            }).error(function(data2){
                //                                file.commentsSaving = false;
                //                                file.errorCommentsSave=true;
                //                                file.errorMsg=file.errorMsg +'<Cmnt: '+'Server Error- Try Again'+'>  ';
                //                                file.saved=!thisScope.savingUsersInfo(file); // last one out closes the door
                //                            });
                //                        }
                // save Publish
                if (file.usersGfyPublish != file.usersGfyPublishTemp) {
                    file.saved = false;
                    file.publishSaving = true;
                    var dataT = {};
                    dataT['gfyId'] = file.gfyName;
                    if (file.usersGfyPublish == true) dataT['value'] = 1; // using 1 or 0
                    else dataT['value'] = 0;

                    //console.log(dataT);
                    $http.post('/ajax/setPublished', dataT).success(function(data2) {
                        //console.log("published saved" + data2);
                        file.usersGfyPublishTemp = file.usersGfyPublish;
                        if (data2.error != undefined) {
                            file.errorPublishSave = true;
                            file.errorMsg.push('Publish: ' + data2.error);
                            file.usersGfyPublishTemp = null;
                        }

                        file.publishSaving = false;
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    }).error(function(data2) {
                        file.publishSaving = false;
                        file.errorPublishSave = true;
                        file.errorMsg.push('Publish: Server Error- Try Again');
                        file.saved = !thisScope.savingUsersInfo(file); // last one out closes the door
                    });
                }
            }
        },
    };

},])

;