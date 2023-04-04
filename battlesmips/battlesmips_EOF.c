// Do NOT translate this file.
// You are required to translate `battlesmips.c`.
// This file has been provided to make exploring the
// reference implementation easier.
//
// A simplified implementation of the classic board game battleship!
// Version 1.0 (2022/10/04): Team COMP1521 <cs1521@cse.unsw.edu.au>

#include <stdio.h>
#include <stdlib.h>

#define TRUE                1
#define FALSE               0
#define INVALID             -1

#define BOARD_SIZE          7

#define EMPTY               '-'
#define HIT                 'X'
#define MISS                'O'

#define CARRIER_SYMBOL      'C'
#define BATTLESHIP_SYMBOL   'B'
#define DESTROYER_SYMBOL    'D'
#define SUBMARINE_SYMBOL    'S'
#define PATROL_BOAT_SYMBOL  'P'

#define CARRIER_LEN         5
#define BATTLESHIP_LEN      4
#define DESTROYER_LEN       3
#define SUBMARINE_LEN       3
#define PATROL_BOAT_LEN     2

#define BLUE                'B'
#define RED                 'R'

#define UP                  'U'
#define DOWN                'D'
#define LEFT                'L'
#define RIGHT               'R'

#define WINNER_NONE         0
#define WINNER_RED          1
#define WINNER_BLUE         2

typedef struct point {
    int row;
    int col;
} point_t;

void initialise_boards(void);

void initialise_board(char board[BOARD_SIZE][BOARD_SIZE]);

void setup_boards(void);

void setup_board(char board[BOARD_SIZE][BOARD_SIZE],
                 char *player);

void place_ship(char board[BOARD_SIZE][BOARD_SIZE],
                int ship_len, char ship_type);

int is_coord_out_of_bounds(point_t *coord);

int is_overlapping(char board[BOARD_SIZE][BOARD_SIZE]);

void place_ship_on_board(char board[BOARD_SIZE][BOARD_SIZE],
                         char ship_type);

void play_game(void);

void play_turn(void);

int perform_hit(char their_board[BOARD_SIZE][BOARD_SIZE],
                char our_view[BOARD_SIZE][BOARD_SIZE]);

int check_player_win(char their_board[BOARD_SIZE][BOARD_SIZE],
                     char our_view[BOARD_SIZE][BOARD_SIZE]);

int check_winner(void);

void print_board(char board[BOARD_SIZE][BOARD_SIZE]);

void swap_turn(void);

int get_end_row(int start_row, char direction, int ship_len);

int get_end_col(int start_col, char direction, int ship_len);

char blue_board[BOARD_SIZE][BOARD_SIZE];
char red_board [BOARD_SIZE][BOARD_SIZE];
char blue_view [BOARD_SIZE][BOARD_SIZE];
char red_view  [BOARD_SIZE][BOARD_SIZE];

char whose_turn = BLUE;

point_t target;
point_t start;
point_t end;

int main(void) {
    initialise_boards();
    setup_boards();
    play_game();

    return 0;
}

void initialise_boards(void) {
    initialise_board(blue_board);
    initialise_board(blue_view);
    initialise_board(red_board);
    initialise_board(red_view);
}

void initialise_board(char board[BOARD_SIZE][BOARD_SIZE]) {
    for (int row = 0; row < BOARD_SIZE; row++) {
        for (int col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = EMPTY;
        }
    }
}

void setup_boards(void) {
    setup_board(blue_board, "BLUE");
    setup_board(red_board,  "RED");
}

void setup_board(char board[BOARD_SIZE][BOARD_SIZE],
                 char *player) {

    printf("%s, place your ships!\n", player);

    place_ship(board, CARRIER_LEN, CARRIER_SYMBOL);
    place_ship(board, BATTLESHIP_LEN, BATTLESHIP_SYMBOL);
    place_ship(board, DESTROYER_LEN, DESTROYER_SYMBOL);
    place_ship(board, SUBMARINE_LEN, SUBMARINE_SYMBOL);
    place_ship(board, PATROL_BOAT_LEN, PATROL_BOAT_SYMBOL);

    printf("%s, Your final board looks like:\n\n", player);

    print_board(board);
}

void place_ship(char board[BOARD_SIZE][BOARD_SIZE],
                int ship_len, char ship_type) {

    for (;;) {
        printf("Your current board:\n");
        print_board(board);

        printf("Placing ship type %c, with length %d.\n", ship_type, ship_len);

        printf("Enter starting row: ");
        if (scanf(" %d", &start.row) != 1) {
            exit(1);
        }

        printf("Enter starting column: ");
        if (scanf(" %d", &start.col) != 1) {
            exit(1);
        }

        if (is_coord_out_of_bounds(&start)) {
            printf("Coordinates out of bounds. Try again.\n");
            continue;
        }

        printf("Enter direction (U, D, L, R): ");
        char direction_char;
        if (scanf(" %c", &direction_char) != 1) {
            exit(1);
        }

        end.row = get_end_row(start.row, direction_char, ship_len);
        end.col = get_end_col(start.col, direction_char, ship_len);

        if (end.row == INVALID || end.col == INVALID) {
            printf("Invalid direction. Try again.\n");
            continue;
        }

        if (is_coord_out_of_bounds(&end)) {
            printf("Ship doesn't fit in this direction. Try again.\n");
            continue;
        }

        if (start.row > end.row) {
            int temp = start.row;
            start.row = end.row;
            end.row = temp;
        }

        if (start.col > end.col) {
            int temp = start.col;
            start.col = end.col;
            end.col = temp;
        }

        if (!is_overlapping(board)) {
            break;
        }
        printf("Ship overlaps with another ship. Try again.\n");
    }

    place_ship_on_board(board, ship_type);
}

int is_coord_out_of_bounds(point_t *coord) {
    if (coord->row < 0 || coord->row >= BOARD_SIZE) {
        return TRUE;
    }
    if (coord->col < 0 || coord->col >= BOARD_SIZE) {
        return TRUE;
    }
    return FALSE;
}

int is_overlapping(char board[BOARD_SIZE][BOARD_SIZE]) {
    if (start.row == end.row) {
        for (int col = start.col; col <= end.col; col++) {
            if (board[start.row][col] != EMPTY) {
                return TRUE;
            }
        }
    }
    else {
        for (int row = start.row; row <= end.row; row++) {
            if (board[row][start.col] != EMPTY) {
                return TRUE;
            }
        }
    }

    return FALSE;
}

void place_ship_on_board(char board[BOARD_SIZE][BOARD_SIZE],
                         char ship_type) {
    if (start.row == end.row) {
        for (int col = start.col; col <= end.col; col++) {
            board[start.row][col] = ship_type;
        }
    }
    else {
        for (int row = start.row; row <= end.row; row++) {
            board[row][start.col] = ship_type;
        }
    }
}

void play_game(void) {
    int winner = WINNER_NONE;
    while (winner == WINNER_NONE) {
        play_turn();
        winner = check_winner();
    }

    if (winner == WINNER_RED) {
        printf("RED wins!\n");
    } else {
        printf("BLUE wins!\n");
    }
}

void play_turn(void) {
    if (whose_turn == BLUE) {
        printf("It is BLUE's turn!\n");
        print_board(blue_view);
    }
    else {
        printf("It is RED's turn!\n");
        print_board(red_view);
    }

    printf("Please enter the row for your target: ");
    if (scanf("%d", &target.row) != 1) {
        exit(1);
    }

    printf("Please enter the column for your target: ");
    if (scanf("%d", &target.col) != 1) {
        exit(1);
    }

    if (is_coord_out_of_bounds(&target)) {
        printf("Coordinates out of bounds. Try again.\n");
        return;
    }

    int hit_status;
    if (whose_turn == BLUE) {
        hit_status = perform_hit(red_board, blue_view);
    }
    else {
        hit_status = perform_hit(blue_board, red_view);
    }

    if (hit_status == INVALID) {
        printf("You've already hit this target. Try again.\n");
        return;
    }
    if (hit_status == HIT) {
        printf("Successful hit!\n");
        return;
    }
    printf("Miss!\n");
    swap_turn();
}

int perform_hit(char their_board[BOARD_SIZE][BOARD_SIZE],
                char our_view[BOARD_SIZE][BOARD_SIZE]) {
    if (our_view[target.row][target.col] != EMPTY) {
        return INVALID;
    }
    if (their_board[target.row][target.col] != EMPTY) {
        our_view[target.row][target.col] = HIT;
        return HIT;
    }
    our_view[target.row][target.col] = MISS;
    return MISS;
}

int check_winner(void) {
    if (check_player_win(red_board, blue_view)) {
        return WINNER_BLUE;
    }
    if (check_player_win(blue_board, red_view)) {
        return WINNER_RED;
    }
    return WINNER_NONE;
}

int check_player_win(char their_board[BOARD_SIZE][BOARD_SIZE],
                     char our_view[BOARD_SIZE][BOARD_SIZE]) {
    for (int row = 0; row < BOARD_SIZE; row++) {
        for (int col = 0; col < BOARD_SIZE; col++) {
            if (their_board[row][col] != EMPTY && our_view[row][col] == EMPTY) {
                return FALSE;
            }
        }
    }

    return TRUE;
}

void print_board(char board[BOARD_SIZE][BOARD_SIZE]) {
    printf("  ");
    for (int col = 0; col < BOARD_SIZE; col++) {
        printf("%d ", col);
    }
    printf("\n");
    for (int row = 0; row < BOARD_SIZE; row++) {
        printf("%d ", row);
        for (int col = 0; col < BOARD_SIZE; col++) {
            printf("%c ", board[row][col]);
        }
        printf("\n");
    }
}

void swap_turn(void) {
    if (whose_turn == BLUE) {
        whose_turn = RED;
    }
    else {
        whose_turn = BLUE;
    }
}

int get_end_row(int start_row, char direction, int ship_len) {
    if (direction == 'L' || direction == 'R') {
        return start_row;
    }
    if (direction == 'U') {
        return start_row - (ship_len - 1);
    }
    if (direction == 'D') {
        return start_row + (ship_len - 1);
    }
    return INVALID;
}

int get_end_col(int start_col, char direction, int ship_len) {
    if (direction == 'U' || direction == 'D') {
        return start_col;
    }
    if (direction == 'L') {
        return start_col - (ship_len - 1);
    }
    if (direction == 'R') {
        return start_col + (ship_len - 1);
    }
    return INVALID;
}
