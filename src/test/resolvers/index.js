import chai from 'chai';
import { expect } from 'chai';
import sinon from 'sinon';
import  { loginRequired } from '../../graphql/resolvers';
import  resolvers from '../../graphql/resolvers';

const should = chai.should();

describe('Query', function() {
  describe('Hello world!', function() { 
    it('should return hello world!', () => {
      expect(resolvers.Query.hello()).to.equal('Hello world!')
    })
  });

  describe('LoginRequired middleware', function() { 
    it('should throw Unauthorized when no token passed', () => {
      expect(function(){
        loginRequired({ headers: {}})
      }).to.throw('Unauthorized!');
    });

    it('should throw Unauthorized when invalid token passed', () => {
      expect(function(){
        loginRequired({ headers: {
          authorization: 'Bearer invalidToken'
        }})
      }).to.throw('Unauthorized!');
    });
  
    it('should return decoded payload', () => {
      expect(loginRequired({
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5nb2MgVG8iLCJmYWNlYm9va0lkIjoyNzM4MTUwNDgzMTU0NzkxLCJzdWJzY3JpcHRpb24iOjEsImlhdCI6MTYzOTQwMzI2Nn0.ZrYMtay2NiDFqoRd8MhDHN3ho9MntstVWrhdxo9c7gM'
        }
      })).to.deep.equal({
          facebookId: 2738150483154791,
          iat: 1639403266,
          id: 1,
          name: "Ngoc To",
          subscription: 1
      })
    });
  });

  describe('getting user profile', function() { 
    let database;
    beforeEach(() => {
      database = function(tableName) {
        return  {
          select: sinon.stub().resolves([
            { id: 1, productName: 'foobar'},
            { id: 2, productName: 'foobar2'},
          ]),
        }
      }
    });
  
    afterEach(() => {
      database = null
    });
  

    it('should throw Unauthorized when loginRequire is not passed', () => {
      expect(() => resolvers.Query.me({}, {}, { req: { headers: { authorization: "invalid token"}}})).throw('Unauthorized!');
    })

    it('should return user without error', () => {
      expect(resolvers.Query.me({}, {}, { req: { headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5nb2MgVG8iLCJmYWNlYm9va0lkIjoyNzM4MTUwNDgzMTU0NzkxLCJzdWJzY3JpcHRpb24iOjEsImlhdCI6MTYzOTQwMzI2Nn0.ZrYMtay2NiDFqoRd8MhDHN3ho9MntstVWrhdxo9c7gM"}}}))
        .to.deep.equal({
          facebookId: 2738150483154791,
          iat: 1639403266,
          id: 1,
          name: "Ngoc To",
          subscription: 1
        });
    })
  });

  describe('getting a list of products', function () { 

    let database;
    beforeEach(() => {
      database = function(tableName) {
        return  {
          select: sinon.stub().resolves([
            { id: 1, productName: 'foobar'},
            { id: 2, productName: 'foobar2'},
          ]),
        }
      }
    });
  
    afterEach(() => {
      database = null
    });

    it('should call select table name exactly', async () => {
      let database = sinon.spy()
      resolvers.Query.products(null, {}, { database: database });
      expect(database.calledWith('products')).to.equal(true);
    })

    it('should return products without error', async () => {
      const products = await resolvers.Query.products(null, {}, { database });
      expect(products.total).to.equal(2);
      expect(products.items[0]).to.deep.equal({
        id: 1,
        productName: 'foobar'
      });
      expect(products.items[1]).to.deep.equal({
        id: 2,
        productName: 'foobar2'
      });
    })
  });
})

describe('Mutation', function() {

  let database;
  let req;
    beforeEach(() => {
      database = function(tableName) {
        return {
          insert: sinon.stub().resolves([1]),
        }
      };

      req = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5nb2MgVG8iLCJmYWNlYm9va0lkIjoyNzM4MTUwNDgzMTU0NzkxLCJzdWJzY3JpcHRpb24iOjEsImlhdCI6MTYzOTQwMzI2Nn0.ZrYMtay2NiDFqoRd8MhDHN3ho9MntstVWrhdxo9c7gM'
        }
      }
    });
  
    afterEach(() => {
      database = null;
      req = null;
    });

  describe('addProduct', function () { 
    it('should call select table name exactly', async () => {
      let database = sinon.spy()
      resolvers.Mutation.addProduct(null, {}, { database: database });
      expect(database.calledWith('products')).to.equal(true);
    });

    it('should return insertedProduct without error', async () => {
      const insertedProduct = await resolvers.Mutation.addProduct(null, {
        item: { name: 'foobar' }
      }, { database });
      expect(insertedProduct).to.deep.equal({
        id: 1,
        name: 'foobar'
      });
    })
  })

  describe('purchasedProducts', function () { 
    it('should call select table name exactly', async () => {
      let database = sinon.spy()
      resolvers.Mutation.purchaseProduct(null, {}, { database: database, req });
      expect(database.calledWith('purchasedProducts')).to.equal(true);
    });

    it('should return purchaseProduct without error', async () => {
      const insertedProduct = await resolvers.Mutation.purchaseProduct(null, {
        id: 1
      }, { database, req });
      expect(insertedProduct).to.equal(1);
    })
  });

  describe('subcrible', function () { 

    let database;
    let req;
    beforeEach(() => {
      database = function(tableName) {
        return {
          where: sinon.stub().returns(this),
          update: sinon.stub().resolves(1),
        }
      };

      req = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5nb2MgVG8iLCJmYWNlYm9va0lkIjoyNzM4MTUwNDgzMTU0NzkxLCJzdWJzY3JpcHRpb24iOjEsImlhdCI6MTYzOTQwMzI2Nn0.ZrYMtay2NiDFqoRd8MhDHN3ho9MntstVWrhdxo9c7gM'
        }
      }
    });
  
    afterEach(() => {
      database = null;
      req = null;
    });

    it('should call select table name exactly', async () => {
      let database = sinon.spy()
      resolvers.Mutation.subcrible(null, {}, { database: database, req });
      expect(database.calledWith('users')).to.equal(true);
    });

    it('should return purchaseProduct without error', async () => {
      const insertedProduct = await resolvers.Mutation.purchaseProduct(null, {
        id: 1
      }, { database, req });
      expect(insertedProduct).to.equal(1);
    })
  })
})