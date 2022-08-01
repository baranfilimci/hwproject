sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.ntt.sm.hwproject.controller.App", {

        onInit : function () {
        
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });

});