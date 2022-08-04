sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Device, Sorter, Fragment, Spreadsheet, exportLibrary) {
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
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

        onACDialog: function () {
            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        generateUserName: function () {
            const oModel = this.getModel("model");
            const sName = oModel.getProperty("/Name");
            const sSurname = oModel.getProperty("/Surname");
            const aContexts = this.byId("table").getBinding("items").getContexts();
            let aUsernames = [];
            let sUsername = "";
            if (sName !== "" && sSurname !== "") {
                sUsername = sName.charAt(0).toLocaleUpperCase() + sSurname.toLocaleUpperCase();
                aContexts.forEach(oContext => {
                    aUsernames.push(this.getModel().getProperty(oContext.getPath() + "/Username"));
                });
                if (aUsernames.filter(xUsername => xUsername === sUsername).length !== 0) {
                    sUsername = sUsername + (+aUsernames
                        .filter(xUsername => xUsername.includes(sUsername))[aUsernames.filter(xUsername => xUsername.includes(sUsername)).length - 1]
                        .match(/\d/g).toString().replaceAll(",", "") + 1);
                }
            }
            oModel.setProperty("/Username", sUsername);
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
                .finally(() => {
                });
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
            oData.Surname = oModel.Surname
            oData.Birthdate = oModel.Birthdate
            oData.Mail = oModel.Mail

            this.onUpdate(oKey, oData, this.getModel())
                .then((oResponse) => { })
                .catch(() => { })
                .finally(() => {
                    this.onRefresh();
                });
        },
        onReadFunction: function () {
			const oModel = this.getModel("model").getProperty("/");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username:oModel.Username
			});

			this.onRead(oKey, this.getModel())
				.then((oData) => {})
				.catch(() => {})
				.finally(() => {});
		},
        onAddUser: function () {
            const oModel = this.getModel("model");
            const aUsers = oModel.getProperty("/Users");
        
            aUsers.push({
                Username: "",
                Name: "",
                Surname: "",
                Birthdate: null,
                Mail: "@gmail.com"
            });
        
            oModel.setProperty("/Users", aUsers);
        },
        onDeleteUser: function () {
            const oModel = this.getModel("model");
            const aUsers = oModel.getProperty("/Users");
            aUsers.pop();
            oModel.setProperty("/Users", aUsers);
        },
        onCreateMultiUser: function(){
            const aUserInformations = this.getModel("model").getProperty("/Users");
            const oUserInformartionData = {
                Username: "X",
                UserInformationItems: aUserInformations
            };
        
            this.onCreate("/UserInformationSet", oUserInformartionData, this.getModel())
                .then((oResponse) => {
                    MessageToast.show(sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message);
                })
                .catch((oError) => {
        
                })
                .finally(() => {
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
        onShowReadDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.hwproject.fragment.ReadUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onShowMultiDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.hwproject.fragment.CreateMulti", this);
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
            let oTable = this.byId("table"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending;
            let aSorters=[];
            
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
        createColumnConfig: function () {
            let aCols = [];

            aCols.push({
                label: 'Username',
                property: 'Username'
            });

            aCols.push({
                label: 'Name',
                property: 'Name'
            });

            aCols.push({
                label: 'Surname',
                property: 'Surname'
            });

            aCols.push({
                label: 'Birthdate',
                property: 'Birthdate',
                type:EdmType.Date,
            });


            aCols.push({
                label: 'Mail',
                property: 'Mail'
            });

            return aCols;
        },

        onExport: function () {
            let aCols, oSettings, oSheet;
            let aData=[];
            const aContexts = this.byId("table").getBinding("items").getContexts();
            aContexts.forEach(oContext => {
                aData.push(this.getModel().getProperty(oContext.getPath() + "/"));
            });
            aCols = this.createColumnConfig();
            oSettings = {
                workbook: { columns: aCols},
                dataSource: aData,
                fileName: 'Table export.xlsx',
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(() => { })
                .finally(oSheet.destroy);
        },


        onSearch: function (oEvent) {

            var afilter = [];
            var sQuery = oEvent.getParameter("query");

            if (sQuery && sQuery.length > 0) {
                aTableSearchState = [new Filter("Username", FilterOperator.Contains, sQuery)];
            }
            this._applySearch(aTableSearchState);


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
