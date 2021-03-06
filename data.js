var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const WORLD_BANK_DATA_INDEX = 1;
let SourcePPP = 0;
let TargetPPP = 0;
let PPPData;

function getCountryAndPPPData() {
    const year = new Date().getFullYear();
    return fetch(`https://api.worldbank.org/v2/en/country/all/indicator/PA.NUS.PPP?format=json&per_page=20000&source=2&date=${year - 5}:${year}`)
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
        .filter(x => x.value != null)
        .map(x => { return { 'country': x.country.value, 'date': x.date, 'ppp': x.value }; })
        .reduce((acc, curr) => {
        return Object.assign(Object.assign({}, acc), { [curr.country]: Object.assign(Object.assign({}, (acc[curr.country] || [])), { [curr.date]: curr.ppp }) });
    }, {}))
        .catch(() => { console.log(`Failed to retrieve country & PPP data`); return {}; });
}

 // Populates the list of countries in the country select elements
 
function populateCountries() {
    Object.keys(PPPData)
        .sort()
        .map((country) => {
        $('#sourceCountry').append($("<option></option>").text(country).val(country));
        $('#targetCountry').append($("<option></option>").text(country).val(country));
    });
}

 // Calculates and stores the PPP values for the currently selected countries
 
function calculatePPP() {
    const sourceCountry = $('#sourceCountry').val();
    const targetCountry = $('#targetCountry').val();
    updateCountryText();
    SourcePPP = PPPData[sourceCountry][Math.max(...Object.keys(PPPData[sourceCountry]).map(x => parseInt(x)))];
    TargetPPP = PPPData[targetCountry][Math.max(...Object.keys(PPPData[targetCountry]).map(x => parseInt(x)))];
    updateTargetAmount();
    updateTargetAmountTax();
    window.setTimeout(function () {
        document.getElementById('sourceAmount').focus();
    }, 0);
}

 // Calculates the resulting salary given the current input salary

function updateTargetAmount() {
    let sourceAmount = parseFloat($('#sourceAmount').val());
    if (parseFloat($('#sourceIncomeTax').val()) >= 0.0){
        const srcAmt = parseFloat($('#sourceAmount').val());
        const srcIT = parseFloat($('#sourceIncomeTax').val())/100;
        console.log(srcAmt);
        console.log(srcIT);
        sourceAmount =  srcAmt - (srcAmt * srcIT);
    }
    if (sourceAmount && sourceAmount > 0 || sourceAmount == 0) {
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).show();
        $('#sourceAmountLabel').text(`${sourceAmount.toFixed(2)}`);
        const targetAmount = sourceAmount / SourcePPP * TargetPPP;
        $('#output').val(`${targetAmount.toFixed(2)}`);
        $('#targetAmount').text(`${targetAmount.toFixed(2)}`);
    }
    else {
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).hide();
        $('#sourceAmountLabel').text('_______');
        $('#output').val('');
        $('#targetAmount').text('_______');
    }
    // Return focus to the source salary input
    window.setTimeout(function () {
        document.getElementById('sourceAmount').focus();
    }, 0);
}

 // Calculates the resulting salary given the current input salary along with the income tax

function updateTargetAmountTax() {
    const srcAmt = parseFloat($('#sourceAmount').val());
    const srcIT = parseFloat($('#sourceIncomeTax').val())/100;

    const sourceAmount =  srcAmt - (srcAmt * srcIT);
    
    if (sourceAmount && sourceAmount > 0 || sourceAmount == 0) {
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).show();
        $('#sourceAmountLabel').text(`${sourceAmount.toFixed(2)}`);
        const targetAmount = sourceAmount / SourcePPP * TargetPPP;
        $('#output').val(`${targetAmount.toFixed(2)}`);
        $('#targetAmount').text(`${targetAmount.toFixed(2)}`);
    }
    else {
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).hide();
        $('#sourceAmountLabel').text('_______');
        $('#output').val('');
        $('#targetAmount').text('_______');
    }
    // Return focus to the source salary input
    window.setTimeout(function () {
        document.getElementById('sourceIncomeTax').focus();
    }, 0);
}

 // Update all of the country names on the page
 
function updateCountryText() {
    $('#sourceCountryName, #sourceCountryLabel').text($('#sourceCountry').val());
    $('#targetCountryName').text($('#targetCountry').val());
}

 // Perform a one-time initialization of the entire page
 
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        PPPData = yield getCountryAndPPPData();
        populateCountries();
        calculatePPP();
    });
}

$(function () {
    $('.searchableSelect').select2({
        theme: 'bootstrap4',
    });
});