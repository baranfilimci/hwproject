sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
    "use strict";

    return BaseController.extend("com.ntt.sm.hwproject.controller.Object", {

        formatter: formatter,

        onInit : function () {
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
        },
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },
        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/UserInformationSet" + sObjectId);
        },
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Username,
                sObjectName = oObject.UserInformationSet;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
