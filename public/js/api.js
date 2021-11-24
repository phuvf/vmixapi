"use strict"

const vMixApi = {
    ipAddress: '127.0.0.1',
    inputName: 'My input',
    duration: 100,
    items: [],
    datalist: "",
    apiOptions: "",
    groups: [],
    channel: 1,
    init: function () {
        var warningModal = new bootstrap.Modal(document.getElementById('warningModal'), {
            keyboard: false
        });
        const warningDismissed = getCookie('warningDismissed');
        console.log(warningDismissed, typeof(warningDismissed));
        if (warningDismissed != '1') {
            warningModal.show();
        }


        var el = document.getElementById('apiList');
        el.addEventListener('change', (event) => {
            //console.log(`Datalist change ${el.value}`);
            vMixApi.showApiEntry(el.value);
            document.activeElement.blur();
        });
        document.getElementById('inputClear').addEventListener('click', function () {
            el.value = "";
            document.getElementById("apiDetails").innerHTML = "";
            window.history.pushState('', '', `?`);
            vMixApi.addInspiration();
        });
        document.getElementById('dismissWarning').addEventListener('click', function () {
            setCookie('warningDismissed', '1', 365)
        });

        fetch('/data/api.json')
            .then(response => response.json())
            .then((data) => {
                vMixApi.items = data;
                //console.log(data.length)
                this.datalist = "";
                this.apiOptions = "";
                data.forEach(item => vMixApi.buildLists(item));
                vMixApi.groups.sort((a, b) => a.id.localeCompare(b.id));
                vMixApi.groups.forEach((group) => {
                    group.items.sort((a, b) => a.name.localeCompare(b.name))
                });
                document.getElementById('referenceList').innerHTML = vMixApi.buildGroups();
                document.getElementById('apiListOptions').innerHTML = vMixApi.apiOptions;

                //console.log(vMixApi.groups);
                //document.getElementById('groupsWrapper').innerHTML = vMixApi.buildGroups();
                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('function')) {
                    let func = urlParams.get('function');
                    if (data.some(f => f.name === func)) {
                        vMixApi.showApiEntry(func);
                        document.getElementById('apiList').value = func;
                    }
                } else {
                    vMixApi.addInspiration();
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
            let newGroup = { id: item.group, items: [item] }
            this.groups.push(newGroup);
        }
        let html = `<option value="${item.name}">`;
        this.apiOptions += html;
        html = `<li><a data-function="${item.name}" href='/?function=${item.name}' title="${item.notes}">${item.name}</a></li>`;
        this.datalist += html;
        //document.getElementById('referenceList').innerHTML += html;
    },
    buildGroups: function () {
        let html = "";
        this.groups.forEach((g) => {
            let groupName = camel2title(g.id);
            html += `
            <div class='accordion-item' id='referenceList'>
                <h5 class='accordion-header' id='group-${g.id}'>
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${g.id}" aria-expanded="false" aria-controls="collapse${g.id}">
                        ${groupName}
                    </button>
                </h5>
                <div id="collapse${g.id}" class="accordion-collapse collapse" aria-labelledby="group-${g.id}" data-bs-parent="#referenceList">
                    <div class="accordion-body">
            `;
            g.items.forEach((item) => {
                html += `<p class='group-item'><a href='?function=${item.name}'>${item.name}</a></p>`;
            });

            html += `</div></div></div>`;
        });
        return html;
    },
    addInspiration: function () {
        var randomItem = this.items[Math.floor(Math.random() * this.items.length)];
        console.log(randomItem.name);
        let html = `<div style='font-size: 1.5em'>Need inspiration? Try <a href='?function=${randomItem.name}'>${randomItem.name}</a>`;
        document.getElementById('inspiration').innerHTML = html;
        document.getElementById('inspiration').classList.remove('d-none');
    },
    showApiEntry: function (name) {
        const item = this.items.filter((i) => i.name == name)[0];
        if (!item) {
            console.log(`Function ${name} not found`);
            return;
        }
        window.history.pushState('', '', `?function=${item.name}`);
        document.getElementById('inspiration').innerHTML = "";
        document.getElementById('inspiration').classList.add('d-none');
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
                    ${item.hasDuration ? "<tr><td>Duration</td><td>Yes</td></tr>" : ""}
                    ${item.hasSelectedName ? "<tr><td>SelectedName</td><td>Yes</td></tr>" : ""}
                    ${item.hasChannel ? "<tr><td>Channel</td><td>Yes (range 1-8)</td></tr>" : ""}
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


        html += `<h4 class='mb-3 mt-5' style='font-weight: bold; font-size: 1.2em; border-bottom: 2px solid var(--bs-primary); color: var(--bs-primary); padding-bottom: 5px;'>Examples</h4>
                <dl>`
        if (item.hasValue) {
            html += `<dt>Add Shortcut dialog box value</dt>
            <dd><div class='code'>${item.valueExample}</div></dd>`;
        }
        html += `
                    <dt>Companion custom command</dt>
                        <dd>
                        <div class='code'>${this.buildCompanionFragment(item)}</div>
                    </dd>
                    <dt>Web scripting</dt>
                    <dd>
                        <div class='code'>${this.buildWebScriptingFragment(item)}</div>
                    </dd>
                    <dt>VB.NET scripting</dt>
                    <dd>
                        <div class='code'>${this.buildScriptExample(item)}</div>
                    </dd>
                    <dt>HTTP GET request</dt>
                    <dd>
                        <div class='code'><a href="${this.buildHttpExample(item)}" target="_blank">${this.buildHttpExample(item)}</a></div>
                    </dd>
                    <dt>TCP packet ASCII</dt>
                    <dd>
                        <div class='code'>${this.buildTcpExample(item)}</div>
                    </dd>
                </dl>
             
            </div>
        </div>`;
        document.getElementById("apiDetails").innerHTML = html;
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
        if (item.hasSelectedName) {
            q.push(`SelectedName=${item.selectedNameExample}`);
        }
        if (item.hasChannel) {
            q.push(`Channel=${this.channel}`);
        }
        return `${item.name} ${q.join('&')}`;
    },
    buildWebScriptingFragment: function (item) {
        let q = [];
        if (item.hasInput) {
            q.push(`Input=${this.inputName}`);
        }
        if (item.hasValue) {
            q.push(`Value=${item.valueExample}`);
        }
        if (item.hasDuration) {
            q.push(`Duration=500`);
        }
        if (item.hasSelectedName) {
            q.push(`SelectedName=${item.selectedNameExample}`);
        }
        if (item.hasChannel) {
            q.push(`Channel=${this.channel}`);
        }
        return `Function=${item.name}${q.length == 0 ? "" : "&"}${q.join('&')}`
    },
    buildHttpExample: function (item) {
        let queryParams = this.buildWebScriptingFragment(item);
        return `http://${this.ipAddress}:8088/api/?${encodeURI(queryParams)}`;
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
        if (item.hasChannel) {
            q.push(`Channel:="${this.channel}""`);
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
    .replace(/([A-Z])/g, (match) => ` ${match.toLowerCase()}`)
    .replace(/^./, (match) => match.toUpperCase())
    .replace("Ptz", "PTZ")
    .replace("Ndi", "NDI")
    .trim();

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}