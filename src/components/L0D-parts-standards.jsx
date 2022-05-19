const L0DPartsStandards = {
  loop: {
    name: 'Loop',
    default: {
      5: 'a',
      3: 'b'
    },
    ohs: {
      a: {
        'name': 'A',
        'oh': 'GGAG'
      },
      b: {
        'name': 'B',
        'oh': 'TACT'
      },
      c: {
        'name': 'C',
        'oh': 'AATG'
      },
      d: {
        'name': 'D',
        'oh': 'AGGT',
        'tc': true
      },
      e: {
        'name': 'E',
        'oh': 'GCTT'
      },
      f: {
        'name': 'F',
        'oh': 'CGCT'
      },
      x: {
        'name': 'X',
        'oh': 'TGGA',
        'tc': true
      },
    }
  },
  feak:{
    name: 'Fake',
    default: {
      5: 'f1',
      3: 'f2'
    },
    ohs: {
      f1: {
        'name': 'F1',
        'oh': 'XXXX'
      },
      f2: {
        'name': 'F2',
        'oh': 'XXXX'
      },
    }
  }
}

export default L0DPartsStandards;
