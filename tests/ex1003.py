import os
import sys
import math

passed = 0
errors = []

def check(cond, msg):
    global passed
    if cond:
        passed += 1
    else:
        errors.append(msg)

def main():
    try:
        sys.path.insert(0, "repo")
        from graph import Graph
    except ImportError as e:
        errors.append("Nao foi possivel importar graph.py: " + str(e))
        return

    # Estrutura base
    g = Graph()
    g.add_vertex("A")
    check("A" in g.vertices, "add_vertex('A') deveria adicionar o vertice")
    g.add_edge("A", "B", 1)
    g.add_edge("B", "C", 2)
    g.add_edge("A", "C", 5)
    check("B" in g.vertices and "C" in g.vertices, "add_edge deveria criar vertices automaticamente")

    try:
        g.remove_vertex("Z")
        errors.append("remove_vertex('Z') inexistente deveria lancar KeyError")
    except KeyError:
        passed += 1

    try:
        g.remove_edge("A", "Z")
        errors.append("remove_edge com aresta inexistente deveria lancar KeyError")
    except KeyError:
        passed += 1

    # BFS
    bfs_result = g.bfs("A")
    check(isinstance(bfs_result, list), "bfs deveria retornar uma lista")
    check(bfs_result[0] == "A", "bfs deveria comecar pelo vertice inicial")
    check(set(bfs_result) == {"A", "B", "C"}, "bfs deveria visitar todos os vertices conectados")

    try:
        g.bfs("Z")
        errors.append("bfs('Z') inexistente deveria lancar KeyError")
    except KeyError:
        passed += 1

    # DFS
    dfs_result = g.dfs("A")
    check(isinstance(dfs_result, list), "dfs deveria retornar uma lista")
    check(dfs_result[0] == "A", "dfs deveria comecar pelo vertice inicial")

    # Dijkstra
    dists = g.dijkstra("A")
    check(isinstance(dists, dict), "dijkstra deveria retornar um dicionario")
    check(dists.get("A") == 0, "dijkstra: distancia de A para A deveria ser 0")
    check(dists.get("B") == 1, "dijkstra: distancia de A para B deveria ser 1")
    check(dists.get("C") == 3, "dijkstra: distancia de A para C deveria ser 3 (A->B->C)")

    # Shortest path
    path = g.shortest_path("A", "C")
    check(isinstance(path, list), "shortest_path deveria retornar uma lista")
    check(path[0] == "A" and path[-1] == "C", "shortest_path deveria comecar em A e terminar em C")

    # has_cycle
    g2 = Graph()
    g2.add_edge("X", "Y")
    g2.add_edge("Y", "Z")
    check(not g2.has_cycle(), "grafo simples sem ciclo deveria retornar False em has_cycle")
    g2.add_edge("Z", "X")
    check(g2.has_cycle(), "grafo com ciclo deveria retornar True em has_cycle")

    # is_connected
    check(g.is_connected(), "grafo conectado deveria retornar True em is_connected")
    g3 = Graph()
    g3.add_vertex("solo")
    g3.add_edge("1", "2")
    check(not g3.is_connected(), "grafo desconectado deveria retornar False em is_connected")

    # Representação
    adj_list = g.to_adjacency_list()
    check(isinstance(adj_list, dict), "to_adjacency_list deveria retornar um dicionario")
    adj_matrix = g.to_adjacency_matrix()
    check(isinstance(adj_matrix, list), "to_adjacency_matrix deveria retornar uma lista")

if __name__ == "__main__":
    main()
    ok = len(errors) == 0
    output_parts = [str(passed) + " verificacoes OK"] if ok else errors[:6]
    output = "; ".join(output_parts).replace("\n", " ").replace('"', "'")[:400]
    result = f"passed={'true' if ok else 'false'}\noutput={output}\n"
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(result)
    print(result)
