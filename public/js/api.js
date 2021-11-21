"use strict"

const vMixApi = {
    ipAddress: '127.0.0.1',
    inputName: 'My input',
    duration: 100,
    items: [],
    init: function(){
        var el = document.getElementById('apiList')
        el.addEventListener('change', (event) => {
            //console.log(`Datalist change ${el.value}`);
            vMixApi.showApiEntry(el.value);
          });
        fetch('/data/api.json')
            .then(response => response.json())
            .then((data) => {
                vMixApi.items = data;
                data.forEach(item => vMixApi.addToDatalist(item));
            });
    },
    addToDatalist: function(item) {
        let html = `<option value="${item.name}">`;
        document.getElementById('apiListOptions').innerHTML += html;
        html = `<li><a data-function="${item.name}" href='#' title="${item.notes}">${item.name}</a></li>`;
        document.getElementById('referenceList').innerHTML += html;
    },
    showApiEntry: function(name) {
        const item = this.items.filter((i)=>i.name == name)[0];
        if (!item) {
            console.log(`Function ${name} not found`);
            return;
        }
        window.history.pushState('', '', `?function=${item.name}`);
        let html =   `
        <div class="card">
            <h5 class="card-header">${item.name}</h5>
            <div  class="card-body">
                <p class=card-text'>${item.notes == "" ? "<i>(no further description available)</i>" : item.notes}</p>
                <p class='card-text'>Function parameters: <span class='inlineCode'>${this.renderParameters(item)}</span></p>
                ${item.hasValue? this.renderValueFormat(item) : ""}
                <p class='card-text'>Examples:</p>
                <dl>
                    <dt>HTTP</dt>
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
                </dl>
             
            </div>
        </div>`;
        document.getElementById("apiDetails").innerHTML = html;
    },
    renderParameters: function(item) {
        if (!item.hasValue && !item.hasInput && !item.hasDuration) {
            return "None";
        }
        let params = [];
        if (item.hasValue) {params.push("Value");} 
        if (item.hasInput) {params.push("Input");} 
        if (item.hasDuration) {params.push("Duration");} 
        return params.toString();
    },
    renderValueFormat: function(item) {
        let params = `${item.valueParam1},${item.valueParam2},${item.valueParam3},${item.valueParam4}`;
        return `<p>Value parameter format: <span class='inlineCode'>${params.replace(/(\s*,?\s*)*$/, "")}</span></p>`;
    },
    buildHttpExample: function(item) {
        let queryParams = "";
        if (item.hasInput) {
            queryParams += `&Input=${encodeURIComponent(this.inputName)}`
        }
        if (item.hasDuration) {
            queryParams += `&Duration=${this.duration}`
        }
        if (item.hasValue) {
            queryParams += `&Value=${item.valueExample}`
        }
        return `http://${this.ipAddress}:8088/api/?Function=${item.name}${queryParams}`;
    },
    buildTcpExample: function(item) {
        let st = `FUNCTION ${item.name}`;
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

        return `${st} ${q.join('&')}\\r\\n`;
    },
    buildScriptExample: function(item) {
        //API.Function("SetImageVisibleOff",Input:="Scorebug",SelectedName:="Top-Inning.Source")
        let q = [];
        if (item.hasInput) {
            q.push(`Input:="${this.inputName}"`);
        }
        if (item.hasValue) {
            q.push(`Value:="${item.valueExample}"`);
        }
        if (item.hasDuration) {
            q.push(`Duration:=500`);
        }
        if (item.hasSelectedName) {
            q.push(`SelectedName:=${item.selectedNameExample}`);
        }
        return `API.Function("${item.name}"${q.length == 0 ? "" : ","}${q.join(', ')})`;
    }
}

ready();

function ready(fn) {
    if (document.readyState != 'loading'){
      vMixApi.init();
    } else {
      document.addEventListener('DOMContentLoaded', vMixApi.init);
    }
  }

