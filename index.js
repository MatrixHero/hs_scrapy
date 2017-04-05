'use strict';
var AV = require("leancloud-storage");
var request = require('request');
var async = require('async');
var config = require('./config');
require('colors');

AV.init({
    appId: config.config.app_id,
    appKey: config.config.app_key,
});
// var MongoClient = require('mongodb').MongoClient;
// var DB_CONN_STR = 'mongodb://localhost:27017/test';
// var mdb;

// MongoClient.connect(DB_CONN_STR, function(err, db) {
//     console.log('数据库连接成功');
//     mdb = db;
// });
console.log(config);
request = request.defaults({
    headers: config.headers
});

var totalPage = 1;
var curPage = 0;
var nextPage = 0;
var pageIndex = 1;
var classIndex = 0;
var cardClasses = ['mage', "druid", "hunter", "paladin", "priest", "rogue", "shaman", "warlock", "warrior", "neutral"];



async.doUntil(getCard4Class, lastClass, function(error) {
    console.log('抓取完成'.bgGreen);
    mdb.close();
});

function getCard4Class(callback) {
    async.doUntil(getCard4Page, lastPage, function(error) {
        if (error) {
            console.log(error);
            callback(error);
            throw error;
        }
        classIndex++;
        pageIndex = 1;
        callback();
    });
}

function getCard4Page(callback) {

    var formData = {
        cardClass: cardClasses[classIndex],
        golden: '1',
        t: '1490928261701',
        token: 'fd4834aa-7d9f-4b5d-9694-73a5776d73b6',
        p: pageIndex,
        cost: ' '
    };
    console.log('准备抓取' + cardClasses[classIndex] + pageIndex + '完成 ');
    request.post({ url: 'http://hs.blizzard.cn/cards/query', form: formData }, function(err, res, body) {
        if (err) {
            console.log(error);
            callback(err);
        } else {
            var obj = JSON.parse(body)
            console.log('抓取' + cardClasses[classIndex] + pageIndex + '完成 ');
            // var collection = mdb.collection('cards');
            async.forEachOf(obj.cards, function(obj, index, callback1) {
                // //更新数据
                // var whereStr = { "id": obj.id };
                // var updateStr = { $set: obj };
                // collection.insert(obj, function(err, result) {
                //     if (err) {
                //         console.log('Error:' + err);
                //         callback1(err);
                //         return;
                //     }
                //     // console.log('更新' + obj.name);
                //     callback1();
                // });
                // 声明类型
                var Card = AV.Object.extend('Card');
                // 新建对象
                var card = new Card();
                // 设置名称
                card.set('id', obj.id);
                card.set('name', obj.name);
                card.set('code', obj.code);
                card.set('description', obj.description);
                card.set('background', obj.background);
                card.set('imageUrl', obj.imageUrl);
                card.set('golden', obj.golden);
                card.set('cardType', obj.cardType);
                card.set('cardClass', obj.cardClass);
                card.set('neutralClass', obj.neutralClass);
                card.set('cardRarity', obj.cardRarity);
                card.set('cost', obj.cost + '');
                card.set('attack', obj.attack + '');
                card.set('health', obj.health + '');
                card.set('durability', obj.durability + '');
                card.set('cardEffect', obj.cardEffect);
                card.set('cardRace', obj.cardRace);
                card.set('cardSet', obj.cardSet);
                card.set('consume', obj.consume + '');
                card.set('gain', obj.gain + '');
                card.set('artist', obj.artist);
                card.set('createTime', obj.createTime);
                card.set('updateTime', obj.updateTime);
                card.save().then(function(todo) {
                    callback1();
                }, function(error) {
                    console.error(error);
                });
            }, function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback();
            });

            if (typeof(obj.totalPage) !== 'undefined') {
                totalPage = obj.totalPage;
            }
            if (typeof(obj.nextPage) !== 'undefined') {
                nextPage = obj.nextPage;
            }
            if (typeof(obj.nextPage) !== 'undefined') {
                pageIndex = parseInt(nextPage);
            }
        }
    });

}

function lastClass(callback) {
    return parseInt(classIndex) == cardClasses.length;
}

function lastPage(callback) {
    return parseInt(nextPage) === 1;
}

// { "prePage": 9, "total": 69, "curCardClass": "mage", "nextPage": 2, "totalPerClass": { "druid": 69, "hunter": 70, "mage": 69, "neutral": 432, "paladin": 69, "priest": 69, "rogue": 69, "shaman": 69, "warlock": 69, "warrior": 69 }, "curPage": 1, "pageSize": 8, "totalPage": 9, "cards": [{ "id": 1837, "name": "冰冻药水", "code": "FreezingPotion", "description": "冻结一个敌人。", "background": "冻住，不许走！", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/FreezingPotion.png", "golden": 0, "cardType": "spell", "cardClass": "mage", "neutralClass": "", "cardRarity": "common", "cost": 0, "attack": "", "health": "", "durability": "", "cardEffect": "", "cardRace": "", "cardSet": "msog", "consume": "", "gain": "", "artist": "Arthur Bozennet", "createTime": "", "updateTime": "" }, { "id": 1537, "name": "禁忌烈焰", "code": "ForbiddenFlame", "description": "消耗你所有的法力值，对一个随从造成等同于所消耗法力值数量的伤害。", "background": "警告：只有持有上古之神所颁发的侍僧执照才可以使用禁忌烈焰，否则后果自负！", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/ForbiddenFlame.png", "golden": 0, "cardType": "spell", "cardClass": "mage", "neutralClass": "", "cardRarity": "epic", "cost": 0, "attack": "", "health": "", "durability": "", "cardEffect": "", "cardRace": "", "cardSet": "wotog", "consume": "", "gain": "", "artist": "Hideaki Takamura", "createTime": "", "updateTime": "" }, { "id": 90, "name": "冰枪术", "code": "Ice Lance", "description": "使一个角色冻结，如果它已经被冻结，则改为对其造成4点伤害。", "background": "这个把戏的重点是别把冰枪弄断。否则，“冰渣术”可就没这么厉害了。", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/Ice+Lance.png", "golden": 0, "cardType": "spell", "cardClass": "mage", "neutralClass": "", "cardRarity": "common", "cost": 1, "attack": "", "health": "", "durability": "", "cardEffect": "", "cardRace": "", "cardSet": "expert", "consume": 40, "gain": 5, "artist": "Alex Horley Orlandelli", "createTime": "", "updateTime": "" }, { "id": 1792, "name": "呓语魔典", "code": "BabblingBook", "description": "战吼：随机将一张法师的法术牌置入你的手牌。", "background": "它梦想有一天能像《荆棘谷的青山》一样，“永远”留在冒险者的任务日志里。", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/BabblingBook.png", "golden": 0, "cardType": "minion", "cardClass": "mage", "neutralClass": "", "cardRarity": "common", "cost": 1, "attack": 1, "health": 1, "durability": "", "cardEffect": "battlecry", "cardRace": "other", "cardSet": "karazhan", "consume": "", "gain": "", "artist": "A.J. Nazzaro", "createTime": "", "updateTime": "" }, { "id": 1195, "name": "奥术冲击", "code": "ArcaneBlast", "description": "对一个随从造成2点伤害。该法术在受到法术伤害的增益效果时，效果翻倍。", "background": "双倍效果，双重感受！", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/ArcaneBlast.png", "golden": 0, "cardType": "spell", "cardClass": "mage", "neutralClass": "", "cardRarity": "epic", "cost": 1, "attack": "", "health": "", "durability": "", "cardEffect": "", "cardRace": "", "cardSet": "tgt", "consume": 400, "gain": 100, "artist": "Gabor Szikszai", "createTime": "", "updateTime": "" }, { "id": 609, "name": "奥术飞弹", "code": "Arcane Missiles", "description": "造成3点伤害，随机分配给敌方角色。", "background": "既然你想要做一个超级厉害的法师，就必须得把奥术飞弹控制得好一些。", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/Arcane+Missiles.png", "golden": 0, "cardType": "spell", "cardClass": "mage", "neutralClass": "", "cardRarity": "free", "cost": 1, "attack": "", "health": "", "durability": "", "cardEffect": "", "cardRace": "", "cardSet": "basic", "consume": "", "gain": "", "artist": "Warren Mahy", "createTime": "", "updateTime": "" }, { "id": 1838, "name": "暗金教侍从", "code": "KabalLackey", "description": "战吼：在本回合中，你使用的下一个奥秘的法力值消耗为（0）点。", "background": "他配置的药水粘稠度很高。", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/KabalLackey.png", "golden": 0, "cardType": "minion", "cardClass": "mage", "neutralClass": "", "cardRarity": "common", "cost": 1, "attack": 2, "health": 1, "durability": "", "cardEffect": "battlecry", "cardRace": "", "cardSet": "msog", "consume": "", "gain": "", "artist": "Andrew Hou", "createTime": "", "updateTime": "" }, { "id": 99, "name": "法力浮龙", "code": "Mana Wyrm", "description": "每当你施放一个法术时，便获得+1攻击力。", "background": "这些法力浮龙以奥术能量为食。所以尽管这些捣蛋鬼不会成为真正的威胁，你也不应该让它们接近任何法术力源。", "imageUrl": "http://hearthstone.nos.netease.com/1/cards/mage/Mana+Wyrm.png", "golden": 0, "cardType": "minion", "cardClass": "mage", "neutralClass": "", "cardRarity": "common", "cost": 1, "attack": 1, "health": 3, "durability": "", "cardEffect": "", "cardRace": "other", "cardSet": "expert", "consume": 40, "gain": 5, "artist": "Blizzard Cinematics", "createTime": "", "updateTime": "" }] }