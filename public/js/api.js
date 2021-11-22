"use strict"

const vMixApi = {
    ipAddress: '127.0.0.1',
    inputName: 'My input',
    duration: 100,
    items: [],
    datalist: "",
    apiOptions: "",
    groups:[],
    init: function () {
        var el = document.getElementById('apiList');
        el.addEventListener('change', (event) => {
            //console.log(`Datalist change ${el.value}`);
            vMixApi.showApiEntry(el.value);
            document.activeElement.blur();
        });
        document.getElementById('inputClear').addEventListener('click', function () {
            console.log(`Clear click`);
            el.value="";
            document.getElementById("apiDetails").innerHTML = "";
            window.history.pushState('', '', `?`);
        });
        fetch('/data/api.json')
            .then(response => response.json())
            .then((data) => {
                vMixApi.items = data;
                console.log(data.length)
                this.datalist = "";
                this.apiOptions = "";
                data.forEach(item => vMixApi.buildLists(item));
                document.getElementById('referenceList').innerHTML = vMixApi.datalist;
                document.getElementById('apiListOptions').innerHTML = vMixApi.apiOptions;

                vMixApi.groups.sort((a,b) => a.id.localeCompare(b.id));
                console.log(vMixApi.groups);
                //document.getElementById('groupsWrapper').innerHTML = vMixApi.buildGroups();

                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('function')) {
                    let func = urlParams.get('function');
                    if (data.some(f => f.name === func)) {
                        vMixApi.showApiEntry(func);
                        document.getElementById('apiList').value = func;
                    }
                }
            });
    },
    buildLists: function (item) {
        let activeGroup = this.groups.filter((g) => g.id === item.group)
        if (activeGroup.length > 0) {
            //console.log(`group ${item.group} found`);
            //console.log(activeGroup);
            activeGroup[0].items.push(item);
        }
        else {
            //console.log(`Creating group ${item.group}`)
            let newGroup = {id: item.group, items: [item]}
            this.groups.push(newGroup);
        }
        let html = `<option value="${item.name}">`;
        this.apiOptions += html;
        html = `<li><a data-function="${item.name}" href='/?function=${item.name}' title="${item.notes}">${item.name}</a></li>`;
        this.datalist += html;
        //document.getElementById('referenceList').innerHTML += html;
    },
    buildGroups: function(){
        let html = "";
        this.groups.forEach((g) => {
            html += `<div class='group'><div class='group-header'>${camel2title(g.id)}</div>`;
            g.items.forEach((item)=>{
                html += `<p class='group-item'><a href='?function=${item.name}'>${item.name}</a></p>`;
            });

            html+= `</div>`;
        });
        return html;
    },
    showApiEntry: function (name) {
        const item = this.items.filter((i) => i.name == name)[0];
        if (!item) {
            console.log(`Function ${name} not found`);
            return;
        }
        window.history.pushState('', '', `?function=${item.name}`);
        let html = `
        <div class="card apiCard">
            <h5 class="card-header">${item.name}</h5>
            <div  class="card-body">
                ${item.alert ? item.alert : ""}
                <p class=card-text' style='white-space: pre-wrap;'>${item.notes == "" ? "<i>(no further description available)</i>" : item.notes}</p>
                <table class='table'>
                    <tr><th>Parameter</th><th>Required</th></tr>
                    <tr><td>Input</td><td>${item.hasInput ? "Yes" : "No"}</td></tr>
                    <tr><td>Value</td><td>${item.hasValue ? `Yes - format: ${this.renderValueFormat(item)}` : "No"}</td></tr>
                    <tr><td>Duration</td><td>${item.hasDuration ? "Yes" : "No"}</td></tr>
                    <tr><td>SelectedName</td><td>${item.hasSelectedName ? "Yes" : "No"}</td></tr>
                </table>`;
        if (item.valueParam1Notes.concat(item.valueParam2Notes) != "") {
            html += `
            <table class='table'>
                    <tr><th>Value parameter element</th><th>Notes</th></tr>
                    <tr><td><span class='inlineCode'>${item.valueParam1}</span></td><td style='white-space: pre-wrap;'>${item.valueParam1Notes}</td></tr>
                    ${item.valueParam2 == "" ? "" : `<tr><td><span class='inlineCode'>${item.valueParam2}</span></td><td style='white-space: pre-wrap;'>${item.valueParam2Notes}</td></tr>`}
                </table>
            `
        }
                

        html += `<h4 class='mb-3 mt-5'>Examples</h4>
                <dl>`
        if (item.hasValue) {
            html += `<dt>vMix "Add Shortcut" dialog box - value field</dt>
            <dd><div class='code'>${item.valueExample}</div></dd>`;
        }
        html +=`
                    <dt>Companion custom command</dt>
                        <dd>
                        <div class='code'>${this.buildCompanionFragment(item)}</div>
                    </dd>
                    <dt>HTTP GET request</dt>
                    <dd>
                        <div class='code'><a href="${this.buildHttpExample(item)}" target="_blank">${this.buildHttpExample(item)}</a></div>
                    </dd>
                    <dt>TCP (Port 8099)</dt>
                    <dd>
                        <div class='code'>${this.buildTcpExample(item)}</div>
                    </dd>
                    <dt>VB.NET scripting</dt>
                    <dd>
                        <div class='code'>${this.buildScriptExample(item)}</div>
                    </dd>
                    <dt>Web scripting</dt>
                    <dd>
                        <div class='code'>${this.buildWebScriptingFragment(item)}</div>
                    </dd>
                </dl>
             
            </div>
        </div>`;
        document.getElementById("apiDetails").innerHTML = html;
    },
    renderParameters: function (item) {
        if (!item.hasValue && !item.hasInput && !item.hasDuration) {
            return "None";
        }
        let params = [];
        if (item.hasValue) { params.push("Value"); }
        if (item.hasInput) { params.push("Input"); }
        if (item.hasDuration) { params.push("Duration"); }
        return params.toString();
    },
    renderValueFormat: function (item) {
        let params = `${item.valueParam1},${item.valueParam2},${item.valueParam3},${item.valueParam4}`;
        return `<span class='inlineCode'>${params.replace(/(\s*,?\s*)*$/, "")}</span>`;
    },
    buildCompanionFragment: function (item) {
        let q = [];
        if (item.hasInput) {
            q.push(`Input=${this.inputName}`);
        }
        if (item.hasValue) {
            q.push(`Value=${item.valueExample}`);
        }
        if (item.hasDuration) {
            q.push(`Duration=${this.duration}`);
        }
        return `${item.name} ${q.join('&')}`;
    },
    buildWebScriptingFragment: function (item) {
        let q = [];
        if (item.hasInput) {
            q.push(`Input=${encodeURIComponent(this.inputName)}`);
        }
        if (item.hasValue) {
            q.push(`Value=${encodeURI(item.valueExample)}`);
        }
        if (item.hasDuration) {
            q.push(`Duration=500`);
        }
        if (item.hasSelectedName) {
            q.push(`SelectedName=${item.selectedNameExample}`);
        }
        return `Function=${item.name}${q.length == 0 ? "" : "&"}${q.join('&')}`
    },
    buildHttpExample: function (item) {
        let queryParams = this.buildWebScriptingFragment(item);
        return `http://${this.ipAddress}:8088/api/?${queryParams}`;
    },

    buildTcpExample: function (item) {
        return `FUNCTION ${this.buildCompanionFragment(item)}\\r\\n`;
    },
    buildScriptExample: function (item) {
        //API.Function("SetImageVisibleOff",Input:="Scorebug",SelectedName:="Top-Inning.Source")
        let q = [];
        if (item.hasInput) {
            q.push(`Input:="${this.inputName}"`);
        }
        if (item.hasValue) {
            q.push(`Value:="${item.valueExample}"`);
        }
        if (item.hasDuration) {
            q.push(`Duration:="500"`);
        }
        if (item.hasSelectedName) {
            q.push(`SelectedName:="${item.selectedNameExample}"`);
        }
        return `API.Function("${item.name}"${q.length == 0 ? "" : ", "}${q.join(', ')})`;
    }
}

ready();

function ready(fn) {
    if (document.readyState != 'loading') {
        vMixApi.init();
    } else {
        document.addEventListener('DOMContentLoaded', vMixApi.init);
    }
}

const camel2title = (camelCase) => camelCase
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase())
  .trim();