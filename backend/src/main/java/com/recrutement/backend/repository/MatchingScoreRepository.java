package com.recrutement.backend.repository;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.MatchingScore;
import com.recrutement.backend.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchingScoreRepository extends JpaRepository<MatchingScore, Long> {

    // ✅ Trouve le premier score pour un CV et une offre
    Optional<MatchingScore> findFirstByCvAndOffre(CV cv, Offre offre);

    // ✅ Trouve tous les scores d'un CV
    List<MatchingScore> findByCv(CV cv);

    // ✅ Scores triés par ordre décroissant pour une offre
    @Query("SELECT ms FROM MatchingScore ms WHERE ms.offre.id = :offreId ORDER BY ms.score DESC")
    List<MatchingScore> findByOffreIdOrderByScoreDesc(@Param("offreId") Long offreId);
}