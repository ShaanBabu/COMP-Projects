"""
Q-Learning agent

Author: Elliot Colp
Modified by: Claude Sammut

This is an implementation of a standard Q-learning algorithm.
The original code mapped "similar" tiles to the same state, e.g. all tiles not touching any wall
mapped to one state, all tiles with a wall on the left mapped to another state, etc.
This was changed to the more common representation of one state corresponding to one tile.

update 17/1/2023: added "list" to As = list(where(Qs == maxQ)[0])
    Previously caused an error in Python 3.11 on mac

"""

from agent import *
import random
import gridworld
import numpy as np


class SARSA(Agent):
    def reset(self):
        Agent.reset(self)
        self.epsilon = 0.1
        self.alpha = 0.1
        self.gamma = 1

    # Use your modified action selection method

        self.rnd_numbers = []

        self.rnd_index = 0

    # open random numbers text file and read individually
        with open ("random_numbers.txt", "r") as file:
            for line in file:
                self.rnd_numbers.append(float(line.strip()))

    def self_action(self, state):

        # similar to Qlearning read and use numbers from file
        rnd = self.rnd_numbers[self.rnd_index]

        # increment the index to keep track of the random numbers
        self.rnd_index += 1

        if rnd < self.epsilon:
            # if this condition is true return the worst state
            # if same value pick at random
            Qs = self.Q[state]
            minQ = min(Qs)
            As = list(where(Qs == minQ)[0])
            A = As[0]
        else:
            # pick best option and select value at random if same
            Qs = self.Q[state]
            maxQ = max(Qs)
            As = list(where(Qs == maxQ)[0])
            A = As[0]
        
        return A

    def do_step(self, S, act, logfile=None):
        Agent.do_step(self, S, act, logfile)

        S = self.get_S()

        A = self.self_action(S)

        R, Sp = act(A)

        Ap = self.self_action(Sp)

        # Update steps using SARA algorithm formula provided in question
        self.Q[S][A] += self.alpha * (R + self.gamma * self.Q[Sp][Ap] - self.Q[S][A])

    def update_alpha(self, event=None):
        if self.testmode: return
        
        self.alpha = self.alpha_var.get()
    
    def update_epsilon(self, event=None):
        if self.testmode: return
        
        self.epsilon = self.epsilon_var.get()
    
    def update_gamma(self, event=None):
        if self.testmode: return
        
        self.gamma = self.gamma_var.get()
        
    def set_testmode(self, enabled):
        if not self.testmode and enabled:
            self.tempAlpha = self.alpha
            self.tempEpsilon = self.epsilon
            self.alpha = 0
            self.epsilon = 0
        
        elif self.testmode and not enabled:
            self.alpha = self.tempAlpha
            self.epsilon = self.tempEpsilon
        
        Agent.set_testmode(self, enabled)

    def init_options(self, master):
        # Alpha
        frame = LabelFrame(master)
        frame["text"] = "Alpha"
        frame["padx"] = 5
        frame["pady"] = 5
        frame.grid(row=0, column=0)
        
        self.alpha_var = DoubleVar()
        self.alpha_var.set(self.alpha)
        scale = Scale(frame)
        scale["from"] = 1
        scale["to"] = 0
        scale["resolution"] = 0.05
        scale["orient"] = VERTICAL
        scale["variable"] = self.alpha_var
        scale["command"] = self.update_alpha
        scale.pack()
        
        # Epsilon
        frame = LabelFrame(master)
        frame["text"] = "Epsilon"
        frame["padx"] = 5
        frame["pady"] = 5
        frame.grid(row=1, column=0)
        
        self.epsilon_var = DoubleVar()
        self.epsilon_var.set(self.epsilon)
        scale = Scale(frame)
        scale["from"] = 1
        scale["to"] = 0
        scale["resolution"] = 0.05
        scale["orient"] = VERTICAL
        scale["variable"] = self.epsilon_var
        scale["command"] = self.update_epsilon
        scale.pack()
        
        # Gamma
        frame = LabelFrame(master)
        frame["text"] = "Gamma"
        frame["padx"] = 5
        frame["pady"] = 5
        frame.grid(row=2, column=0)
        
        self.gamma_var = DoubleVar()
        self.gamma_var.set(self.gamma)
        scale = Scale(frame)
        scale["from"] = 1
        scale["to"] = 0
        scale["resolution"] = 0.05
        scale["orient"] = VERTICAL
        scale["variable"] = self.gamma_var
        scale["command"] = self.update_gamma
        scale.pack()
