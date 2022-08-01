sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',

], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Device, Sorter, Fragment, exportLibrary, Spreadsheet) {
    "use strict";
    let EdmType = exportLibrary.EdmType;

    return BaseController.extend("com.ntt.sm.hwproject.controller.Worklist", {

        formatter: formatter,

        
        onInit: function () {
            var oViewModel;
            this._mViewSettingsDialogs = {};
            
            this._aTableSearchState = [];

            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

        onACDialog: function () {
            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },
        generateUserName: function(){
            let fname=this.getModel("model").getProperty("/Name").charAt(0).toUpperCase();
            let lname=this.getModel("model").getProperty("/Surname").toUpperCase();
            let result=fname+lname;
            this.getModel("model").getProperty("/Username")==result;
            
        },
        onCreateUser: function () {
            const oUserInformation = this.getModel("model").getProperty("/");
            let oUserInformartionData = {};

            oUserInformartionData.Username = oUserInformation.Username;
            oUserInformartionData.Name = oUserInformation.Name;
            oUserInformartionData.Surname = oUserInformation.Surname;
            oUserInformartionData.Birthdate = oUserInformation.Birthdate;
            oUserInformartionData.Mail = oUserInformation.Mail;

            this.onCreate("/UserInformationSet", oUserInformartionData, this.getModel())
                .then((oResponse) => {
                })
                .catch(() => { })
                .finally(() => { });
        },
        onDeleteUser: function () {
            const oModel = this.getModel("model").getProperty("/");
            const oKey = this.getModel().createKey("/UserInformationSet", {
                Username: oModel.Username
            });
            this.onDelete(oKey, this.getModel())
                .then(() => { })
                .catch(() => { })
                .finally(() => {
                    onACDialog();
                });
        },
        onUpdateUser: function () {
			
			const oModel = this.getModel("model").getProperty("/");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username: oModel.Username
			});
            let oData = {};

            oData.Username = oModel.Username
            oData.Name = oModel.Name
            oData.Surname  = oModel.Surname
            oData.Birthdate = oModel.Birthdate
            oData.Mail = oModel.Mail

			this.onUpdate(oKey, oData, this.getModel())
				.then((oResponse) => {})
				.catch(() => {})
				.finally(() => {
                    this.onRefresh();
                });
		},

        onShowCreateDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.hwproject.fragment.CreateUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onShowDeleteDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.hwproject.fragment.DeleteUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onShowUpdateDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.hwproject.fragment.UpdateUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },
        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("com.ntt.sm.hwproject.fragment.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("table"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sort(aSorters);
        },

        onUpdateFinished: function (oEvent) {
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        onPress: function (oEvent) {
            this._showObject(oEvent.getSource());
        },

        onNavBack: function () {
            history.go(-1);
        },
        createColumnConfig: function() {
			return [
				{
					label: 'Username',
					property: 'Username',
					scale: 0
				},
				{
					label: 'Firstname',
					property: 'Name',
					width: '25'
				},
				{
					label: 'Lastname',
					property: 'Lastname',
					width: '25'
				},
				{
					label: 'Birthdate',
					property: 'Birthdate',
					
					width: '18'
				},
			];
		},

		onExport: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig();
			aProducts = this.getView().getModel().getProperty('/');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts,
                worker: false
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(() => {})
				.finally(oSheet.destroy);
		},


        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {

                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Username", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },


        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/UserInformationSet".length)
            });
        },


        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});
