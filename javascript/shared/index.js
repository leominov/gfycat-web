/* Copyright (C) GfyCat, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Date: 12/1/2015
 */

angular.module('gfycat.shared', []);

require('./util.js');
require('./filters.js');
require('./factorys/gfy-account-tree.js');
require('./factorys/album-edit-factory.js');
require('./factorys/gfy-edit-factory.js');
require('./factorys/gfy-edit-factory-old.js');
require('./factorys/gfy-feeds-factory.js');
require('./factorys/gfy-modal-machine.js');
require('./factorys/msg-machine-factory.js');
require('./factorys/gfy-http-factory.js');
require('./factorys/gfy-search-factory.js');
require('./factorys/oauth-interceptor-factory.js');
require('./factorys/gif.categories.factory.js');
require("./services/GFAN.js");
require('./services/gfy-analytics-service.js');
require('./factorys/gfy-partner-factory.js');
require('./factorys/gfy-team-factory.js');
require('./services/account/account-service.js');
require('./services/account/folder-service.js');
require('./services/account/bookmark-service.js');
require('./services/account/album-service.js');
require('./services/viewcounter/websocket-service.js');
require('./services/helpers/http-helper-service.js');
require('./services/helpers/gfy-helper-service.js');
require('./services/helpers/profile-helper-service.js');
require('./services/account/oauth-token-service.js');
require('./directives/livecounter/livecounter.js');
require('./directives/showfocus/showfocus.js');
