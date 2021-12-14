import { expect } from 'chai';
import sinon from 'sinon';
import  resolvers, { loginRequired } from '../../graphql/resolvers';
import pubsub, { USER_NOTIFICATION } from '../../subscription';
import { PubSub } from 'graphql-subscriptions';

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

    it('should refer correct table', async () => {
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
    it('should refer correct table', async () => {
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
    it('should refer correct table', async () => {
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
          where: sinon.stub().returns({
            update: sinon.stub().resolves(1),
          }),
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

    it('should refer correct table', async () => {
      let spyDatabase = sinon.spy()
      resolvers.Mutation.subcrible(null, {}, { database: spyDatabase, req });
      expect(spyDatabase.calledWith('users')).to.equal(true);
    });

    it('should subcrible without error', async () => {
      const subcribleResult = await resolvers.Mutation.subcrible(null, {}, { database, req });
      expect(subcribleResult).to.equal('Success');
    })

    it('should return fail when get error', async () => {
      const stubDatabase = database = function(tableName) {
        return {
          where: sinon.stub().returns({
            update: sinon.stub().throws(),
          }),
          insert: sinon.stub().resolves([1]),
        }
      };
      const subcribleResult = await resolvers.Mutation.subcrible(null, {}, { database: stubDatabase, req });
      expect(subcribleResult).to.equal('Fail');
    })
  })
});
