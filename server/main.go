package main


/*
Wallet ...
*/
type Wallet struct {
	K, B, T float64
}
/*
Map ...
*/
type Map struct {
	ID string
	UserID string
	Data []byte
	ChildrenIDs []string
	Wallet Wallet
	Rate float64
	Price float64
}

/*
Database ...
*/
type Database interface {
	GetMap(id string) Map
	UpdateMap(_map Map)
}

func UpdateMap(_map Map, ) {
}

/*
Server ...
*/
type Server interface {

}
