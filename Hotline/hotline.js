define(function (require, exports, module) {

    'use strict';

    var T = require('tpl/build/hotline');
    var EH = require('lib/js/everhome');
    var Request = require('lib/js/eh_request');
    var Util = require('js/util');
    var Page = require('lib/js/eh_page');
    var FormValid = require('lib/js/eh_form');

    var Hotline = function (container) {
        this.$container = $(container);
        this.$dom = null;
        this.$editDom = null;

        this.organizationId = Util.getOrganizationInfo().id;

        this.page = null;

        this.dialog = null;

        this.form = null;
    };
    Hotline.prototype = {
        init: function () {
            var t = this;
            t.render();
            t.initPage();
        },
        render: function () {
            var t = this;
            t.$dom = $(T({
                tpl: 'main'
            }));
            t.$container.html(t.$dom);
        },
        initPage: function () {
            var t = this;
            t.page = new Page(t.$dom.find('.gov_hotline_page')[0], {
                getData: function (next) {
                    t.getList(next);
                }
            });
            t.page.init();
        },
        getList: function (next) {
            var t = this;
            Request.postlistOrgContact({
                organizationId: t.organizationId,
                pageOffset: next
            }, function (data) {
                t.renderList(t.page.processData(data.response));
                t.bindEvent();
            });
        },
        renderList: function (data) {
            var t = this;
            t.$dom.find('.property_hotline_list tbody').html(T({
                tpl: 'list',
                data: data
            }));
        },
        bindEvent: function () {
            var t = this;
            t.$dom.on('click', '.property_hotline_delete', function () {
                var $target = $(this).closest('tr');
                t.deleteHotline($target);
            });

            t.$dom.on('click', '.property_hotline_edit', function () {
                var $target = $(this).closest('tr');
                t.renderEditing($target.attr('data-memberId'), $target.attr('data-name'), $target.attr('data-phone'));
            });

            t.$dom.on('click', '.property_hotline_add_button', function () {
                t.renderAdd();
            });

            t.$dom.on('click', '.property_hotline_cancel_add', function () {
                $(this).closest('.property_hotline_add').remove();
            });
        },
        renderEditing: function (organizationId, contactName, contactToken) {
            var t = this;
            t.$editDom = $(T({
                tpl: 'edit',
                organizationId: organizationId,
                contactName: contactName,
                contactToken: contactToken
            }));
            t.dialog = new EH.Dialog({
                title: '编辑',
                content: t.$editDom,
                mask: false,
                css: {
                    width: 400,
                    height: 200
                }
            });
            t.dialog.show();
            t.bindEditEvent();
        },
        saveEdit: function (contactName, contactToken) {
            var t = this;
            Request.postupdateOrgContact({
                id : t.organizationId,
                contactName: contactName,
                contactType: '0',
                contactToken: contactToken
            }, function (data) {
                t.refresh();
                EH.Alert('保存成功', 'success');
            });
        },
        bindEditEvent: function () {
            var t = this;
            t.$editDom.on('click', '.property_hotline_edit_ok', function () {
                var hotlineName = t.$editDom.find('.property_input_edit_name').val();
                var hotlinePhone = t.$editDom.find('.property_input_edit_phone').val();

                t.saveEdit(hotlineName, hotlinePhone);
            });
            t.$editDom.on('click', '.property_hotline_cancel_edit', function () {
                t.dialog.close();
            });
        },
        deleteHotline: function ($target) {
            var t = this;
            var id = $target.attr('data-memberId');

            EH.Confirm('确定删除 ' + $target.attr('data-name') + ' ' + $target.attr('data-phone') + ' ?', function () {
                Request.postdeleteOrgContact({
                    id: id,
                }, function (data) {
                    EH.Alert('删除成功!', 'success');
                    t.refresh();
                });
            }, null, '删除确认');
        },
        renderAdd: function () {
            var t = this;
            t.$dom.find('.property_hotline_add_content').html(T({
                tpl: 'add'
            }));
            t.initForm();
        },
        initForm: function () {
            var t = this;
            t.form = FormValid.valid(t.$dom.find('.eh_form_valid')[0], {
                beforeSubmit: function () {
                    t.doSubmit();
                    return false;
                }
            });
        },
        doSubmit: function () {
            var t = this;
            var fData = {
                contactName: t.$dom.find('.property_input_add_name').val(),
                contactToken: t.$dom.find('.property_input_add_phone').val(),
                organizationId: t.organizationId,
                contactType: '0'
            };

            Request.postcreateOrgContact(fData, function () {
                EH.Alert('保存成功', 'success');
                t.refresh();
            });
        },
        refresh: function () {
            var t = this;
            t.init();
        }
    };
    return Hotline;
});
