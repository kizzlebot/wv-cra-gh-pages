import parseName  from '../parseName';

describe('parseName', () => {
  
  it('should format firstName and lastName given object those props', () => {
    const rtn = parseName({
      firstName: 'james',
      lastName: 'choi'
    })
    expect(rtn).toBeDefined();
    expect(rtn).toEqual('James Choi');
  })
  
  it('should format firstName and lastName using obj.user if not exist at top-level', () => {
    const rtn = parseName({
      user: {
        firstName: 'james',
        lastName: 'choi'
      }
    });

    expect(rtn).toBeDefined();
    expect(rtn).toEqual('James Choi');
  });
  
});