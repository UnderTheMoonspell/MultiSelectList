(function ($, document, window) {
    'use strict';
    var pluginName = 'select-list';
    var defaultOptions = {
        width: "100%",
        defaultClass: 'select-list-active',
        autocompleteFromServer : false
    };

    var fetchedData;
    var offlineMode = true;
    var dropdownClass = "select-list-dropdown";
    var dropdowndiv = $('<div class="' + dropdownClass + ' display-none"' + ' ></div>');
    var dropdownSpanClass = "select-list-dropdown-option";

    var resultDivClass = "select-list-result";
    var resultDiv = $('<div class=' + resultDivClass + '></div>');
    var resultDivBorderClass = "select-list-result-border";
    var resultLineClass = "select-list-result-line";
    var resultLineRemoveClass = "select-list-remove-img";
    var resultLineTextClass = "select-list-result-text";
    var resultLine = '<div class=' + resultLineClass + '><span class=' + resultLineTextClass + ' data-result-line-value="{0}">{1}</span><span class=' + resultLineRemoveClass + '></span></div>';
    
    var finalObject = [];

    function SelectList(elem, options) {
        this.$elem = $(elem);
        this.name = pluginName;

        this.$elem.data(pluginName, this);
        this.options = $.extend(defaultOptions, options);
        this.parent = this.$elem.parent();

        /** @private */
        this._fillDropDown = fillDropDown;
        /** @private */
        this._autocomplete = autocomplete;

        this.init();
    };

    SelectList.prototype = {
        init: function () {
            var _this = this;
            if (!_this.$elem.hasClass('select-list') || !_this.$elem.is('input')) {
                throw "Invalid input for select list";
            }

            if (_this.$elem.hasClass(_this.options.defaultClass)) {
                throw "Already initialized use .data(select-list).destroy()";
            }

            $(_this.$elem)
                .addClass(_this.options.defaultClass)
                .css({ 'width': _this.options.width })
                .after(resultDiv)
                .after(dropdowndiv.css('top', $(_this.$elem).outerHeight()))
                .parent().css('position', 'relative');
            _this._fillDropDown();
        },

        destroy: function () {
            var _this = this;
            _this.$elem.removeData();
            _this.$elem.off('.' + this.name);
            _this.$elem.removeClass(_this.options.defaultClass).css({ 'width': '' });
            _this.parent.css('position', '').find('div').remove();
        },

        getChoices: function () {
            return finalObject;
        }
    };


    function bindEvents(_this) {
        _this.$elem.off('.' + _this.name).on('keyup.' + pluginName, function () {
            _this._autocomplete($(this).val());
        })
        .on('focus.' + pluginName, function () {
            _this.parent.find('.' + dropdownClass).removeClass('display-none');
        })
        .on('blur.' + pluginName, function () {
            _this.parent.find('.' + dropdownClass).addClass('display-none');

        })
        .parent().find('.' + dropdownClass + ' span').off('.' + _this.name).on('mousedown.' + pluginName, function () {
            _this.parent.find('.' + resultDivClass).append(resultLine.replace('{1}', $(this).text()).replace('{0}', $(this).attr('data-dropdown-value')))._borderClass();
            finalObject.push({ 'value': 0, 'text': $(this).text() });
        });

        _this.$elem.parent().off('.' + _this.name).on('click.' + pluginName, '.' + resultLineRemoveClass, function () {
            var clickedValue = $(this).attr('data-result-line-value');
            var arrayIndex = $.each(finalObject, function (index, object) {
                if (object.value == clickedValue) {
                    return index;
                }
            });
            finalObject.splice(arrayIndex, 1);

            $(this).parent().remove();
            _this.$elem.parent().find('.' + resultDivClass)._borderClass();
        });

        $.fn._borderClass = function () {
            if (this.find('span').length > 0) {
                this.addClass(resultDivBorderClass);
            } else {
                this.removeClass(resultDivBorderClass);
            }
            return this;
        }
    };

    function fillDropDown() {
        var _this = this;
        var dropdown = _this.parent.find('.' + dropdownClass);
        if (_this.options.dataURL) {
            var url = _this.options.dataURL;
            $.ajax({
                type: 'GET',
                url: url,
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response) {
                        fetchedData = response;
                        offlineMode = defaultOptions.autocompleteFromServer ? false : true;
                        changeDropDownOptions(dropdown, fetchedData, _this);
                    }
                },
                error: function () {
                    throw "Error fetching data from server";
                }
            });
        } else if (_this.options.dataSource) {
            fetchedData = this.options.dataSource;
            offlineMode = true;
            changeDropDownOptions(dropdown, fetchedData, _this);
        } else {
            throw "Invalid source";
        }
    };

    function autocomplete(query) {
        var _this = this;
        var dropdown = _this.parent.find('.' + dropdownClass);
        if (!offlineMode) {
            if (query.length < 3 && query.length > 0) {
                return;
            }          
            var url = query != '' ? _this.options.dataURL + '?searchString=' + query : _this.options.dataURL;           
            $.ajax({
                type: 'GET',
                url: url,
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    dropdown.empty()
                    if (response) {
                        changeDropDownOptions(dropdown, response, _this);
                    }
                },
                error: function () {
                    throw "Error fetching data from server";
                }
            });
        } else {
            var filteredData = fetchedData.filter(function (object) {
                var match = object.Text.match('^' + query);
                return match ? true : false;
            })
            changeDropDownOptions(dropdown, filteredData, _this);
        }
    }

    function changeDropDownOptions(dropdown, options, plugin) {
        dropdown.empty();
        for (var item in options) {
            dropdown.append('<span class=' + dropdownSpanClass + ' data-dropdown-value=' + options[item].Value + ' >' + options[item].Text + '</span>');
        }
        bindEvents(plugin);
    }

    $.fn.selectList = function (options) {
        return this.each(function () {
            new SelectList(this, options);
        });
    };

})(jQuery, document, window);