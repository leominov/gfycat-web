(function() {
    angular.module("gfycatApp",["infinite-scroll", "cfp.hotkeys", "ngAnimate", "ui.router", "ngRoute", "ngModal", "accountFilesApp", "ngclipboard", "pascalprecht.translate", "profileApp", "gfycat.shared", "ngDraggable", "utils.showfocus"]).constant("debug", false);

    angular.element(document).ready(function(){
        angular.bootstrap(document, ["gfycatApp"]);
        console.log("        __                 _\n       / _|               | |\n  __ _| |_ _   _  ___ __ _| |_\n / _` |  _| | | |/ __/ _` | __|\n| (_| | | | |_| | (_| (_| | |_\n \\__, |_|  \\__, |\\___\\__,_|\\__|\n  __/ |     __/ |\n |___/     |___/\n\n%c LOVE GIFS? We're Hiring! -> https://gfycat.com/jobs <-", "background: blue; color: white; display: block;");
    });

    require("../shared/index");
    require("./_components/index");
    require("./account_module/index");
    require("./app.config.js");
    require("./app.js");
    require("./app.routes.js");
    require("./channels_page/channels.page.controller.js");
    require("./detail_page/detailpage_controller.js");
    require("./gif_categories/gif.categories.controller.js");
    require("./main_page/mainpage_controller.js");
    require("./partner_signup_page/partner_signup_controller.js");
    require("./profile_module/index");
    require("./reset_password_page/reset-password_controller.js");
    require("./search_page/search_controller.js");
    require("./settings_page/index");
    require("./signup_page/signup_controller.js");
    require("./static_page/apps/index.js");
    require("./static_page/apps/slack.controller.js");
    require("./static_page/partners/partnerspage_controller.js");
    require("./static_page/team/team_page_controller.js");
    require("./verify_email_page/verify_email_controller.js");
})();
