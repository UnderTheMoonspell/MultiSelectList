(function ($, document, window) {
    'use strict';
    var pluginName = 'select-list';
    var defaultOptions = {
        width: '100%',
        defaultClass: 'select-list-active',
        autocompleteFromServer: false,
        autocompleteMinLength: 3,
        verticalDisplay: false,
        prevData: '',
        dataURL: '',
        dataSource: ''
    };
    var offlineMode = true;
    var dropdownClass = "select-list-dropdown";
    var dropdowndiv = $('<div class="' + dropdownClass + '" style="display:none;"></div>');
    var dropdownSpanClass = "select-list-dropdown-option";

    var resultDivClass = "select-list-result";
    var resultDiv = $('<div class="' + resultDivClass + '"></div>');
    var resultDivBorderClass = "select-list-result-border";
    var resultLineClass = "select-list-result-line";
    var resultLineRemoveClass = "select-list-remove-img";
    var resultLineTextClass = "select-list-result-text";
    var resultLine = '<div class="' + resultLineClass + '"><span class="' + resultLineTextClass + '" data-result-line-value="{0}">{1}</span><span class="' + resultLineRemoveClass + '"></span></div>';


    function SelectList(elem, options) {
        this.$elem = $(elem);
        this.$elem.data(pluginName, this);
        this.name = pluginName;
        this.options = $.extend({}, defaultOptions, options);
        this.$parent = this.$elem.parent();
		this.fetchedData = [];
        this.finalObject = [];
        /** @private */
        this._fillDropDown = fillDropDown;
        /** @private */
        this._autocomplete = autocomplete;
        this.init();
    };

    $.extend(SelectList.prototype, {
        init: function () {
            var _this = this;
            if (_this.options.verticalDisplay) {
                resultLine = '<div>' + resultLine + '</div>';
            }

            if (!_this.$elem.is('input')) {
                throw "Invalid input for select list";
            }

            if (_this.$elem.hasClass(_this.options.defaultClass)) {
                throw "Already initialized use .data(select-list).destroy()";
            }

            $(_this.$elem)
                .addClass(_this.options.defaultClass)
                .css({ 'width': _this.options.width }).parent().css('position', 'relative');

            $(_this.$elem).after(resultDiv.clone().css('width', _this.options.width))
                .after(dropdowndiv.clone().css({ 'top': $(_this.$elem).outerHeight() + $(_this.$elem).position().top, 'width': _this.options.width }));

            _this._fillDropDown();

            $(document).mouseup(function (e) {
                var container = _this.$elem
                if (!container.is(e.target)
                    && container.has(e.target).length === 0) {
                    container = _this.$parent.find('.' + dropdownClass);
                    if (!container.is(e.target)
                        && container.has(e.target).length === 0) {
                        _this.$parent.find('.' + dropdownClass).hide();
                    }
                }
            });
        },

        destroy: function () {
            var _this = this;
            _this.$elem.removeData();
            _this.$elem.off('.' + this.name);
            _this.$elem.removeClass(_this.options.defaultClass).css({ 'width': '' });
            _this.$parent.css('position', '').find('div').remove();
        },

        getChoices: function () {
            return this.finalObject;
        },

        getChoicesCSV: function () {
            var returnString = "";
            for (var item in this.finalObject) {
                returnString = returnString + this.finalObject[item].Value + ','
            }
            return returnString.substr(0, returnString.length - 1);
        }
    });


    function _bindEvents(_this) {
        _this.$elem.off('.' + _this.name).on('keyup.' + pluginName, function () {
            _this._autocomplete($(this).val());
        })
        .on('focus.' + pluginName, function () {
            _this.$parent.find('.' + dropdownClass).css('display', 'block');
        });
        _this.$parent.find('.' + dropdownClass + ' span').off('.' + _this.name).on('mousedown.' + pluginName, function () {
            _this.$parent.find('.' + resultDivClass).append(resultLine.replace('{1}', $(this).text()).replace('{0}', $(this).attr('data-dropdown-value')))._borderClass();

            $(this).css('display', 'none');
            _this.finalObject.push({ Value: $(this).attr('data-dropdown-value'), Text: $(this).text() });

        });

        _this.$parent.off('.' + _this.name).on('click.' + pluginName, '.' + resultLineRemoveClass, function () {
            var clickedValue = $(this).prev().attr('data-result-line-value');
            _this.$parent.find('.' + dropdownClass).css('display', 'none').find('span[data-dropdown-value=' + clickedValue + ']').css('display', 'block');
            var arrayIndex;
            $.each(_this.finalObject, function (index, object) {
                if (object.Value == clickedValue) {
                    arrayIndex = index;
                    return;
                }
            });
            _this.finalObject.splice(arrayIndex, 1);

            $(this).parent().remove();
            _this.$elem.parent().find('.' + resultDivClass)._borderClass();

        });
    };

    function fillDropDown() {
        var _this = this;
        var dropdown = _this.$parent.find('.' + dropdownClass);
        if (_this.options.dataURL) {
            var url = _this.options.dataURL;
            $.ajax({
                type: 'GET',
                url: url,
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    try{
                        if (response) {
                            _this.fetchedData = JSON.parse(response);
                            offlineMode = defaultOptions.autocompleteFromServer ? false : true;
                            _changeDropDownOptions(dropdown, _this.fetchedData, _this);
                        }
                    }
                    catch (error) {
                        throw "Error parsing JSON";
                    }
                },
                error: function () {
                    throw "Error fetching data from server";
                }
            });
        } else if (_this.options.dataSource) {
            _this.fetchedData = this.options.dataSource;
            offlineMode = true;
            _changeDropDownOptions(dropdown, _this.fetchedData, _this);
        } else {
            throw "Invalid data source";
        }
    };

    function autocomplete(query) {
        var _this = this;
        var dropdown = _this.$parent.find('.' + dropdownClass);
        if (!offlineMode) {
            if (query.length < defaultOptions.autocompleteMinLength && query.length > 0) {
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
                        _changeDropDownOptions(dropdown, response, _this);
                    }
                },
                error: function () {
                    throw "Error fetching data from server";
                }
            });
        } else {
            var filteredData = _this.fetchedData.filter(function (object) {
                var regex = new RegExp('^' + query, 'i');
                var test = regex.test(object.Text) ? true : false;
                var alreadyPicked = _this.$parent.find('.' + resultDivClass + ' span[data-result-line-value="' + object.Value + '"]').length > 0 ? true : false;
                return test && !alreadyPicked;
            })
            _changeDropDownOptions(dropdown, filteredData, _this);
        }
    }

    function _changeDropDownOptions(dropdown, options, plugin) {
        dropdown.empty();
        for (var item in options) {
            dropdown.append('<span class=' + dropdownSpanClass + ' data-dropdown-value=' + options[item].Value + ' >' + options[item].Text + '</span>');
        }
        _bindEvents(plugin);
        _fillPreviousData(plugin);
    }

    function _fillPreviousData(pluginInstance) {
        var _this = pluginInstance;
        var prevData = _this.options.prevData;
        if (prevData) {
            for (var item in prevData) {
                var value = prevData[item];
                var $existingElem = _this.$parent.find('.' + dropdownClass + ' span[data-dropdown-value=' + value + ']');
                if ($existingElem.length > 0) {
                    _this.$parent.find('.' + resultDivClass).append(resultLine.replace('{1}', $existingElem.text()).replace('{0}', $existingElem.attr('data-dropdown-value')))._borderClass();
                    _this.finalObject.push({ Value: $existingElem.attr('data-dropdown-value'), Text: $existingElem.text() });
                    $existingElem.hide();
                }
            }
        }
    };

    $.fn.selectList = function (options) {
        this.each(function () {
            new SelectList(this, options);
        });
        return this;
    };

    $.fn._borderClass = function () {
        if (this.find('span').length > 0) {
            this.addClass(resultDivBorderClass);
        } else {
            this.removeClass(resultDivBorderClass);
        }
        return this;
    }

})(jQuery, document, window);







