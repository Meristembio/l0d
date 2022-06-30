import React, {Component} from 'react'
import Select from 'react-select'

import L0DPartsStandards from "./components/L0D-parts-standards"

import {
    clearSequence,
    getReverseComplementSequenceString,
    tmSeq
} from './components/Helpers'
import {
    defaultEnzymesByName,
    getCutsitesFromSequence,
    aliasedEnzymesByName,
    getAminoAcidFromSequenceTriplet,
    aminoAcidToDegenerateDnaMap
} from 've-sequence-utils'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


class Highlight extends Component {
    render() {
        if (this.props.text) {
            let overlay_text = ""
            switch (this.props.type) {
                case 'eswen':
                    overlay_text = "Restriction site"
                    break
                case 'doh':
                    overlay_text = "Domestication overhang"
                    break
                case 'oh':
                    overlay_text = "Overhang"
                    break
                case 'seq':
                    overlay_text = "Sequence"
                    break
                case 'res':
                    overlay_text = "Internal restriction site"
                    break
                case 'res_dom':
                    overlay_text = "Internal restriction site (domesticated)"
                    break
                case 'tc':
                    overlay_text = "Overhang complement bases for frame conservation"
                    break
                case 'stop':
                    overlay_text = "Stop codon"
                    break
                default:
                    break
            }
            if (this.props.extra)
                overlay_text += " " + this.props.extra
            return <OverlayTrigger key={"ot" + this.props.key} placement="top" overlay={
                <Tooltip id={"id" + this.props.key}>{overlay_text}</Tooltip>
            }>
                <span className={"hl hl-" + this.props.type}>{this.props.text}</span>
            </OverlayTrigger>
        }
        return <i></i>
    }
}


class InputOHS extends Component {
    render() {
        const standard = L0DPartsStandards[this.props.standard]
        return <Form.Select
            onChange={this.props.handler}
            value={this.props.cv}
            aria-label={standard.name + " OHs / " + this.props.oh + "'"}
            className="oh-select" ref={"ref" + this.props.oh}>
            {Object.keys(standard.ohs).map((key) => {
                return (
                    <option key={key}
                            value={key}>{standard.ohs[key].name + " - " + standard.ohs[key].oh + (standard.ohs[key].tc ? ' [ '+ this.props.tc +' ]' : '') + (standard.ohs[key].stop ? ' [ STOP ]' : '')}</option>
                )
            })}
            <option key="custom" value="custom">Custom</option>
        </Form.Select>
    }
}

class OHInput extends Component {
    render() {
        return <FloatingLabel controlId={"ohs" + this.props.oh}
                              label={this.props.standard + " OHs / " + this.props.oh + "'"}>
            <InputOHS
                standard={this.props.standard}
                oh={this.props.oh}
                handler={this.props.handler}
                cv={this.props.cv}
                tc={this.props.tc}
            />
        </FloatingLabel>
    }
}

class Primer extends Component {
    render() {
        return <div>
            <div>{"> " + this.props.name + "-" + this.props.type + " (" + this.props.seq.length + " bp)"}</div>
            <div className="alert alert-warning">{this.props.seq}</div>
        </div>
    }
}

class PrimerDesign extends Component {
    render() {
        const fragment_name = this.props.name + "-F" + (this.props.idx + 1)
        let primers = []
        const finalSeq = this.props.eswen + this.props.extra5 + this.props.template + this.props.extra3 + getReverseComplementSequenceString(this.props.eswen)
        let method = "pcr"
        let method_text = "PCR"
        let tm_warning = ""
        if (finalSeq.length <= this.props.pcrMinLength) {
            method = "oann"
            method_text = "Oligo Annealing"
        }
        if(method === "oann"){
            primers.push(<Primer seq={finalSeq} name={fragment_name} type={"F"}/>)
            primers.push(<Primer seq={getReverseComplementSequenceString(finalSeq)} name={fragment_name} type={"R"}/>)
        } else {
            let tmSeq_dir = tmSeq(this.props.template, this.props.pcrTm)
            let tmSeq_rc = tmSeq(getReverseComplementSequenceString(this.props.template), this.props.pcrTm)
            if(tmSeq_dir === "minTempNotReached" || tmSeq_dir === "minLengthError"){
                tmSeq_dir = this.props.template
                tmSeq_rc = getReverseComplementSequenceString(this.props.template)
                if(tmSeq_dir === "minTempNotReached")
                    tm_warning = <div className="alert alert-danger">Tm below min requirement</div>
                if(tmSeq_dir === "minLengthError")
                    tm_warning = <div className="alert alert-danger">Template length below min requirement (7 bp)</div>
            }
            const finalSeq_fwd = this.props.eswen + this.props.extra5 + tmSeq_dir
            primers.push(<Primer seq={finalSeq_fwd} name={fragment_name} type={"F"}/>)
            const finalSeq_rev = this.props.eswen + getReverseComplementSequenceString(this.props.extra3) + tmSeq_rc
            primers.push(<Primer seq={finalSeq_rev} name={fragment_name} type={"R"}/>)
            // primers.push(<Primer seq={getReverseComplementSequenceString(tmSeq_rc) + this.props.extra3 + getReverseComplementSequenceString(this.props.eswen) } name={fragment_name} type={"R (RC)"}/>)
        }
        return (<div className="alert alert-light border text-break">
            <h5>{fragment_name}</h5>
            <div className="small mb-3">Method: {method_text}</div>
            {tm_warning}
            {primers}
        </div>)
    }
}

class ResEditor extends Component {
    constructor(props) {
        super(props)
        if (props.new_res === undefined)
            this.resInputHandle(this.props.res.idx, this.props.res.seq)
    }

    resInputHandle = (i, v) => {
        this.props.resInputHandle(i, v)
    }

    getNucleotidesFromIUPAC(letter){
        switch (letter.toLowerCase()) {
            case 'a':
                return ['a']
            case 't':
                return ['t']
            case 'c':
                return ['c']
            case 'g':
                return ['g']
            case 'r':
                return ['g', 'a']
            case 'y':
                return ['t', 'c']
            case 'm':
                return ['a', 'c']
            case 'k':
                return ['g', 't']
            case 's':
                return ['g', 'c']
            case 'w':
                return ['a', 't']
            case 'h':
                return ['a', 'c', 't']
            case 'b':
                return ['g' , 't', 'c']
            case 'v':
                return ['g', 'c' , 'a']
            case 'd':
                return ['g', 'a', 't']
            case 'n':
                return ['g', 'a', 'c', 't']
            default:
                return letter
        }
    }

    generateVariations(triplet){
        if(triplet.length === 1)
            return this.getNucleotidesFromIUPAC(triplet)

        const alternatives = []
        const firstLetterVariations = this.getNucleotidesFromIUPAC(triplet.charAt(0))
        const sub_alternatives = this.generateVariations(triplet.substring(1, triplet.length))

        firstLetterVariations.forEach((firstLetterVariation) => {
            sub_alternatives.forEach((sub_alternative) => {
                alternatives.push(firstLetterVariation + sub_alternative)
            })
        })
        return alternatives
    }

    getVariation(domesticate){
        if(domesticate.length !== 3){
            alert("Domestication site length != 3")
            return false
        }
        const triplet = aminoAcidToDegenerateDnaMap[getAminoAcidFromSequenceTriplet(domesticate).value.toLowerCase()]
        const results = this.generateVariations(triplet)
        let result = false
        results.forEach((v) => {
            if(v !== domesticate) {
                result = v
            }
        })
        return result
    }

    recommended_codon(){
        const new_res = this.props.new_res
        const res = this.props.res
        if (new_res && new_res.length >= 3) {
            let result = res.seq.substring(0, res.start % 3)
            const domesticate = res.seq.substring(res.start % 3, res.start % 3 + 3)
            const variation = this.getVariation(domesticate)
            if(variation)
                result += variation
            else{
                alert("No variation found")
                return res
            }
            result += res.seq.substring(res.start % 3 + 3, new_res.length)
            return result
        }
        alert("No Restriction enzyme site set")
        return ""
    }

    render() {
        if (this.props.res) {
            let equal_warwing = ""
            let res = this.props.res
            let new_res = this.props.new_res ? this.props.new_res : ""

            if (res.seq.toLowerCase() === new_res.toLowerCase())
                equal_warwing = <div className="alert alert-danger">Restriction site unchanged</div>
            let diferent_length_warwing = ""

            if (res.seq.length !== new_res.length && new_res.length > 0)
                diferent_length_warwing =
                    <div className="alert alert-warning">New restriction site has different length than original</div>

            let frame_string = ""
            if (new_res) {
                let start = new_res.substring(0, res.start % 3) + "-"
                if (start.length === 1)
                    start = ""
                frame_string = " (" + start + new_res.substring(res.start % 3, res.start % 3 + 3) + ")"
            }
            const recommended_codon = this.recommended_codon()

            return <div className="alert alert-info border">
                <h5>Restriction site # {res.idx + 1}</h5>
                <div className="row">
                    <div className="col-7">
                        <FloatingLabel controlId={"resInput" + res.idx} label="New restriction enzyme site">
                            <FormControl onChange={(e) => this.resInputHandle(res.idx, e.target.value)}
                                         value={new_res} aria-label="New restriction enzyme site"/>
                        </FloatingLabel>
                        <div className="mb-2">
                            <button type="button" className="btn btn-secondary me-2"
                                    onClick={(e) => this.resInputHandle(res.idx, res.seq)}>Reset
                            </button>
                            <button type="button" className="btn btn-success me-2" onClick={(e) => this.resInputHandle(res.idx, recommended_codon)}>Recommended
                            </button>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="mb-2 small">
                            <span><strong>Enzyme</strong>: {res.enzyme}</span><br/>
                            <span><strong>Position</strong>: {(res.start + 1) + " to " + (res.end + 1)}</span><br/>
                            <span><strong>Frame position</strong>: {((res.start % 3) + 1) + frame_string}</span><br/>
                        </div>
                    </div>
                </div>
                {equal_warwing}
                {diferent_length_warwing}
            </div>
        } else {
            return <div></div>
        }
    }
}

class Fragments extends Component {
    constructor(props) {
        super(props)
        let new_res = []
        props.res.forEach((re) => {
            new_res.push(re.seq)
        })
        this.state = {
            new_res: new_res
        }
    }


    componentWillReceiveProps(nextProps) {
        let new_res = []
        nextProps.res.forEach((re) => {
            new_res.push(re.seq)
        })
        this.setState({
            new_res: new_res
        })
    }

    commonStart(seq1, seq2) {
        let finalSeq = ""
        for (var i = 0; i < Math.min(seq1.length, seq2.length); i++) {
            if (seq1.charAt(i).toLowerCase() === seq2.charAt(i).toLowerCase()) {
                finalSeq += seq1.charAt(i)
            } else
                break
        }
        return finalSeq
    }

    firstCommonIndexAfterDiff(ref, query) {
        let firstIndex = null
        let diffFound = false
        if (ref.length === query.length)
            for (var i = 0; i < query.length; i++) {
                if (ref.charAt(i).toLowerCase() === query.charAt(i).toLowerCase())
                    if (diffFound && ref.substring(i, query.length) === query.substring(i, query.length)) {
                        firstIndex = i
                        break
                    } else
                        diffFound = true
            }
        return firstIndex
    }

    lastCommonIndex(ref, query) {
        let lastIndex = 0
        for (var i = 0; i < Math.min(ref.length, query.length); i++) {
            if (ref.charAt(i).toLowerCase() === query.charAt(i).toLowerCase())
                lastIndex = i
            else
                break
        }
        return lastIndex
    }

    resParts(ref, query) {
        const lastCommonIndex = this.lastCommonIndex(ref, query)
        const firstCommonIndexAfterDiff = this.firstCommonIndexAfterDiff(ref, query)

        let start = ref.substring(0, lastCommonIndex + 1)
        let diff = ""
        let end = ""
        if (firstCommonIndexAfterDiff && firstCommonIndexAfterDiff > lastCommonIndex) {
            diff = ref.substring(lastCommonIndex + 1, firstCommonIndexAfterDiff)
            end = ref.substring(firstCommonIndexAfterDiff, query.length)
        }

        return {
            'start': start,
            'diff': diff,
            'end': end,
        }
    }

    resInputHandle = (i, v) => {
        let new_res = this.state.new_res
        new_res[i] = clearSequence(v)
        this.setState({
            new_res: new_res
        })
    }

    formatOHEnd(seq, len){
        return seq.substring(0, seq.length - len).toLowerCase() + seq.substring(seq.length - len, seq.length).toUpperCase()
    }

    formatOH(seq, len){
        return seq.substring(0, len).toUpperCase() + seq.substring(len, seq.length).toLowerCase()
    }

    render() {
        let output = []
        let final_sequence = []
        let domestication_output = []
        let fragments = []
        let extra5 = ""
        let extra3 = ""
        let minOhLengthAlert = ""
        let ohs = []
        const stop_codon = 'tga'
        const oh_length = Math.abs(this.props.the_re.topSnipOffset - this.props.the_re.bottomSnipOffset)

        final_sequence.push(<Highlight text={this.props.eswen} type="eswen" key="1"
                                       extra={" (" + this.props.the_re.name + ")"}/>)
        final_sequence.push(<Highlight text={this.props.doh5} type="doh" key="2"/>)
        extra5 += this.props.doh5.toUpperCase()
        ohs.push(this.props.doh5)
        final_sequence.push(<Highlight text={this.props.oh5.oh} type="oh" key="3"/>)
        extra5 += this.props.oh5.oh.toUpperCase()

        if (this.props.res.length) {
            domestication_output.push(<h3>Domestication</h3>)
            let from = 0
            this.props.res.forEach((re, idx) => {
                final_sequence.push(<Highlight text={this.props.seq.substring(from, re.start)} type="seq"
                                               extra={" fragment " + (idx + 1)} key={"s-" + idx}/>)
                let template = this.props.seq.substring(from, re.start)

                let type = "res"
                let seq = re.seq
                if (this.state.new_res[idx] && this.state.new_res[idx] !== re.seq) {
                    type = "res_dom"
                    seq = this.state.new_res[idx]
                }
                final_sequence.push(<Highlight text={seq} type={type} extra={" # " + (idx + 1)} key={"r-" + idx}/>)
                template += this.commonStart(this.state.new_res[idx], re.seq)

                if (idx) {
                    // not the first
                    const resParts = this.resParts(this.state.new_res[idx - 1], this.props.res[idx - 1].seq)
                    extra5 = this.formatOH(resParts.diff, oh_length)
                    template = this.formatOH(resParts.end + template, oh_length - extra5.length)
                    ohs.push((resParts.diff + resParts.end + template).substring(0, 3).toUpperCase())
                }

                const resParts = this.resParts(this.state.new_res[idx], re.seq)
                extra3 = this.formatOH((resParts.diff + resParts.end + this.props.seq.substring(re.end + 1, this.props.seq.length)).substring(0, oh_length), oh_length)
                if(idx !== this.props.res.length - 1)
                    template = this.formatOHEnd(template, oh_length - extra3.length)
                if(extra3.length < oh_length)
                    minOhLengthAlert = <div className="alert alert-danger">OH length under optimal length</div>

                fragments.push({
                    idx: idx,
                    extra5: extra5,
                    template: template,
                    extra3: extra3,
                })
                domestication_output.push(<ResEditor resInputHandle={this.resInputHandle}
                                                     new_res={this.state.new_res[idx]} res={re}/>)
                domestication_output.push(minOhLengthAlert)
                from = re.end + 1

                if(idx === this.props.res.length - 1){
                    // the last
                    final_sequence.push(<Highlight text={this.props.seq.substring(re.end + 1, this.props.seq.length)} type="seq"
                                                   extra={" fragment " + (idx + 2)} key={"s-" + (idx + 1)}/>)
                    const resParts = this.resParts(this.state.new_res[idx], re.seq)
                    extra5 = this.formatOH(resParts.diff, oh_length)
                    template = this.formatOH(resParts.end + this.props.seq.substring(from, this.props.seq.length), oh_length - extra5.length)
                    ohs.push((resParts.diff + resParts.end + template).substring(0, 3).toUpperCase())
                    fragments.push({
                        idx: idx + 1,
                        extra5: extra5,
                        template: template,
                        extra3: "",
                    })
                }
            })
        } else {
            final_sequence.push(<Highlight text={this.props.seq} type="seq" key="s-1"/>)
            fragments.push({
                idx: 0,
                extra5: extra5,
                template: this.props.seq.toLowerCase(),
                extra3: "",
            })
        }

        final_sequence.push(<Highlight text={this.props.oh3.tc ? this.props.tc : ''} type="tc" key="6"/>)
        extra3 = this.props.oh3.tc ? this.props.tc : ''
        final_sequence.push(<Highlight text={this.props.oh3.stop ? stop_codon : ''} type="stop" key="7"/>)
        extra3 += this.props.oh3.stop ? stop_codon : ''
        final_sequence.push(<Highlight text={this.props.oh3.oh} type="oh" key="8"/>)
        extra3 += this.props.oh3.oh.toUpperCase()
        final_sequence.push(<Highlight text={this.props.doh3} type="doh" key="9"/>)
        extra3 += this.props.doh3.toUpperCase()
        ohs.push(this.props.doh3)
        final_sequence.push(<Highlight text={getReverseComplementSequenceString(this.props.eswen)} type="eswen"
                                       key="10" extra={" (RevComp) (" + this.props.the_re.name + ")"}/>)
        fragments[fragments.length - 1].extra3 = extra3

        let fragments_output = []
        fragments.forEach((fragment) => {
            fragments_output.push(<PrimerDesign name={this.props.name} pcrMinLength={this.props.pcrMinLength}
                                                pcrTm={this.props.pcrTm} idx={fragment.idx} extra5={fragment.extra5}
                                                extra3={fragment.extra3} template={fragment.template} eswen={this.props.eswen} />)
        })

        output.push(domestication_output)

        output.push(<h3>Primer design</h3>)
        output.push(fragments_output)

        output.push(<h3>Ligation overhangs</h3>)
        output.push(<div className="alert alert-light border text-break">
            <div className="mb-2">{ohs.join(" / ")}</div>
            <div><a href="https://ggtools.neb.com/viewset/run.cgi" rel="noreferrer" className="fs-6 badge bg-secondary fw-normal text-decoration-none" target="_blank">Ligation Fidelity Viewer <i className="bi bi-box-arrow-up-right"></i></a></div>
        </div>)

        output.push(<h3>Amplicon / Oligo annealing sequence</h3>)
        output.push(<div className="alert alert-light border text-break">{final_sequence}</div>)

        return <div>{output}</div>
    }
}

class L0D extends Component {
    constructor(props) {
        super(props)
        const default_standard = 'loop'
        this.state = {
            sequence: '',
            standard: default_standard,
            custom_oh5: '',
            custom_oh3: '',
            oh5: L0DPartsStandards[default_standard].default[5],
            oh3: L0DPartsStandards[default_standard].default[3],
            pcrTm: 60,
            pcrMinLength: 80,
            name: 'Part',
            tc: 'tc',
            base_pairs_from_end: 'aa',
            enzymes: L0DPartsStandards[default_standard].domestication_enzymes,
        }
    }

    tcInputChangeHandle = (event) => {
        this.setState({
            tc: event.target.value,
        })
    }

    basePairsFromEndInputChangeHandle = (event) => {
        this.setState({
            base_pairs_from_end: event.target.value,
        })
    }


    domEnzymesInputChangeHandle = (event) => {
        let newEnzymes = []
        event.forEach((enzyme) => {
            newEnzymes.push(enzyme.value)
        })
        this.setState({
            enzymes: newEnzymes,
        })
    }

    pcrMinLengthInputChangeHandle = (event) => {
        this.setState({
            pcrMinLength: event.target.value,
        })
    }

    pcrTmInputChangeHandle = (event) => {
        this.setState({
            pcrTm: event.target.value,
        })
    }

    nameInputChangeHandle = (event) => {
        this.setState({
            name: event.target.value,
        })
    }

    sequenceInputChangeHandle = (event) => {
        this.setState({
            sequence: clearSequence(event.target.value),
        })
    }

    partStandardChangeHandle = (event) => {
        this.setState({
            standard: event.target.value,
            oh5: L0DPartsStandards[event.target.value].default[5],
            oh3: L0DPartsStandards[event.target.value].default[3],
        })
    }

    OH5InputChangeHandle = (event) => {
        this.setState({oh5: event.target.value})
    }

    OH3InputChangeHandle = (event) => {
        this.setState({oh3: event.target.value})
    }

    customOh5InputHandle = (event) => {
        this.setState({custom_oh5: clearSequence(event.target.value)})
    }

    customOh3InputHandle = (event) => {
        this.setState({custom_oh3: clearSequence(event.target.value)})
    }

    partStandardInputItems = Object.keys(L0DPartsStandards).map(function (key) {
        return <option key={key} value={key}>{L0DPartsStandards[key].name}</option>
    })

    getEnzymesSelect = (enzymes) => {
        let domesticationEnzymesOutput = []
        enzymes.forEach((enzyme) => {
            domesticationEnzymesOutput.push({value: enzyme, label: defaultEnzymesByName[enzyme].name})
        })
        return domesticationEnzymesOutput
    }

    findInFrame(targets, query){
        for(let t = 0; t < targets.length; t++){
            for(let q = 0; q < query.length; q = q + 3){
                if(targets[t].toLowerCase() === query.substring(q, q + 3).toLowerCase()){
                    return q
                }
            }
        }
        return false
    }


    render() {
        const the_standard = L0DPartsStandards[this.state.standard]
        const domesticationEnzymesOptions = []
        Object.keys(defaultEnzymesByName).forEach(function (k, v) {
            if (defaultEnzymesByName[k].isType2S)
                domesticationEnzymesOptions.push({value: k, label: defaultEnzymesByName[k].name})
        })

        let custom_oh5_input
        if (this.state.oh5 === "custom") {
            custom_oh5_input = <FloatingLabel controlId="customOh5Input" label="Custom OH 5'">
                <FormControl onChange={this.customOh5InputHandle} value={this.state.custom_oh5}
                             aria-label="Custom OH 5"/>
            </FloatingLabel>
        }

        let custom_oh3_input
        if (this.state.oh3 === "custom") {
            custom_oh3_input = <FloatingLabel controlId="customOh3Input" label="Custom OH 3'">
                <FormControl onChange={this.customOh3InputHandle} value={this.state.custom_oh3}
                             aria-label="Custom OH 3"/>
            </FloatingLabel>
        }

        const sequenceInput = this.state.sequence.toLowerCase()
        let output = ""

        if (!sequenceInput) {
            output = <div className="alert alert-info">Set a sequence to continue</div>
        } else {
            let RES = []
            this.state.enzymes.forEach((enzyme_name) => {
                RES.push(aliasedEnzymesByName[enzyme_name])
            })
            const cutSites = getCutsitesFromSequence(sequenceInput, true, RES)

            let restrictionSites = []

            if (Object.keys(cutSites).length) {
                Object.entries(cutSites).forEach(([key, enzymeCuts]) => {
                    enzymeCuts.forEach((enzymeCut, idx) => {
                        const start = enzymeCut.recognitionSiteRange['start']
                        const end = enzymeCut.recognitionSiteRange['end']
                        if(start < end)
                            restrictionSites.push({
                                seq: sequenceInput.substring(enzymeCut.recognitionSiteRange['start'], enzymeCut.recognitionSiteRange['end'] + 1),
                                start: start,
                                end: end,
                                enzyme: enzymeCut.name
                            })
                    })
                    restrictionSites.sort(function (a, b) {
                        return a.start - b.start
                    })
                    restrictionSites.forEach((restrictionSite, idx) => {
                        restrictionSite.idx = idx
                    })
                })
            }

            const the_re = defaultEnzymesByName[the_standard.enzyme]
            const enzymeSiteWithExtraNucl = this.state.base_pairs_from_end + the_re.site.toUpperCase() + the_standard.bases_upto_snip

            let oh5 = {
                name: 'Custom',
                oh: this.state.custom_oh5
            }
            if (this.state.oh5 !== "custom") {
                oh5 = the_standard.ohs[this.state.oh5]
            }
            let oh3 = {
                name: 'Custom',
                oh: this.state.custom_oh3
            }
            if (this.state.oh3 !== "custom") {
                oh3 = the_standard.ohs[this.state.oh3]
            }

            output = <Fragments name={this.state.name} pcrMinLength={this.state.pcrMinLength} pcrTm={this.state.pcrTm}
                                the_re={the_re} res={restrictionSites} oh5={oh5} oh3={oh3}
                                doh5={the_standard.receiver_ohs.oh5} doh3={the_standard.receiver_ohs.oh3}
                                eswen={enzymeSiteWithExtraNucl} seq={sequenceInput} tc={this.state.tc}/>
        }

        let atg_output = <div className="alert alert-alert border">No ATG found in frame 1</div>
        let stop_output = <div className="alert alert-light border">No STOP codon found in frame 1</div>

        let atg_found = this.findInFrame(['atg'], sequenceInput)
        let stop_found = this.findInFrame(['taa', 'tga', 'tag'], sequenceInput)

        if(atg_found !== false)
            atg_output = <div className="alert alert-success">ATG found in frame 1, position {atg_found + 1}</div>

        if(stop_found !== false)
            stop_output = <div className="alert alert-danger">STOP codon found in frame 1, position {stop_found + 1}</div>

        return (
            <Container>
                <Row>
                    <Col lg={6}>
                        <h3>Part name</h3>
                        <FloatingLabel controlId="nameInput" label="Name Input">
                            <FormControl onChange={this.nameInputChangeHandle}
                                         value={this.state.name} aria-label="Name Input"/>
                        </FloatingLabel>
                        <h3>Sequence ({this.state.sequence.length} bp)</h3>
                        <FloatingLabel controlId="sequenceInput" label="Sequence Input">
                            <FormControl onChange={this.sequenceInputChangeHandle} as="textarea"
                                         value={this.state.sequence} aria-label="Sequence Input"/>
                            <Form.Text className="text-muted">
                                Non ATGC characters are automaticlly removed.
                            </Form.Text>
                        </FloatingLabel>
                        {atg_output}
                        {stop_output}
                        <h3>Position</h3>
                        <FloatingLabel controlId="partStandardInput" label="Assembly Standard">
                            <Form.Select onChange={this.partStandardChangeHandle} aria-label="Part standard input">
                                {this.partStandardInputItems}
                            </Form.Select>
                        </FloatingLabel>
                        <OHInput standard={this.state.standard} oh="5" cv={this.state.oh5}
                                 handler={this.OH5InputChangeHandle} tc={this.state.tc}/>
                        {custom_oh5_input}
                        <OHInput standard={this.state.standard} oh="3" cv={this.state.oh3}
                                 handler={this.OH3InputChangeHandle} tc={this.state.tc}/>
                        {custom_oh3_input}
                        <h3>Domestication</h3>
                        <Form.Text className="text-muted">
                            Domestication enzymes
                        </Form.Text>
                        <Select options={domesticationEnzymesOptions} value={this.getEnzymesSelect(this.state.enzymes)}
                                isMulti className="basic-multi-select mb-2" classNamePrefix="select"
                                onChange={this.domEnzymesInputChangeHandle}/>
                        <FloatingLabel controlId="tcInput"
                                       label="Overhang complement bases for frame conservation">
                            <FormControl onChange={this.tcInputChangeHandle}
                                         value={this.state.tc} aria-label="Overhang complement bases for frame conservation"/>
                        </FloatingLabel>
                        <h3>Method parameters</h3>
                        <div>
                            <FloatingLabel controlId="pcrMinLengthInput"
                                           label="Length under which part is prepared by oligo annealing instead of PCR">
                                <FormControl onChange={this.pcrMinLengthInputChangeHandle}
                                             value={this.state.pcrMinLength} aria-label="pcr/oann min length"/>
                            </FloatingLabel>
                            <FloatingLabel controlId="pcrTmInput" label="Tm PCR primers °C">
                                <FormControl onChange={this.pcrTmInputChangeHandle}
                                             value={this.state.pcrTm} aria-label="PCR Tm primers"/>
                            </FloatingLabel>
                            <FloatingLabel controlId="basePairsFromEnd" label="Base pairs from end">
                                <FormControl onChange={this.basePairsFromEndInputChangeHandle}
                                             value={this.state.base_pairs_from_end} aria-label="Base pairs from end"/>
                            </FloatingLabel>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div id="result">
                            {output}
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default L0D
